import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { useLanguage } from '../functions/LanguageProvider'
import './PricingPage.css'

type DropdownOption = { value: string; label: string }
type PricingRow = { service: string; endpoint: string; resolution: string; unit: string; points: string; pointsWithRef?: string; coins: string }

const pricingRows: Record<'video' | 'avatar' | 'image' | 'voice' | 'free', PricingRow[]> = {
  video: [
    { service: 'Seedance 2.5', endpoint: 'POST /wavespeed/bytedance/seedance-2.5/*', resolution: '480p', unit: 'per 5 seconds', points: '4,000 Pts', pointsWithRef: '8,000 Pts', coins: '8 / 16 Coins' },
    { service: 'Seedance 2.5', endpoint: 'POST /wavespeed/bytedance/seedance-2.5/*', resolution: '720p HD', unit: 'per 5 seconds', points: '8,000 Pts', pointsWithRef: '16,000 Pts', coins: '16 / 32 Coins' },
    { service: 'Seedance 2.5', endpoint: 'POST /wavespeed/bytedance/seedance-2.5/*', resolution: '1080p FHD ⭐', unit: 'per 5 seconds', points: '20,000 Pts', pointsWithRef: '40,000 Pts', coins: '40 / 80 Coins' },
    { service: 'Seedance 2.5', endpoint: 'POST /wavespeed/bytedance/seedance-2.5/*', resolution: '4K Ultra HD', unit: 'per 5 seconds', points: '40,000 Pts', pointsWithRef: '80,000 Pts', coins: '80 / 160 Coins' },
    { service: 'SeeDance 2.0', endpoint: 'POST /api/genai/byteplus/video-generation', resolution: '480p', unit: 'per 5 seconds', points: '3,000 Pts', pointsWithRef: '6,000 Pts', coins: '6 / 12 Coins' },
    { service: 'SeeDance 2.0', endpoint: 'POST /api/genai/byteplus/video-generation', resolution: '720p HD', unit: 'per 5 seconds', points: '6,000 Pts', pointsWithRef: '12,000 Pts', coins: '12 / 24 Coins' },
    { service: 'SeeDance 2.0', endpoint: 'POST /api/genai/byteplus/video-generation', resolution: '1080p FHD ⭐', unit: 'per 5 seconds', points: '15,000 Pts', pointsWithRef: '30,000 Pts', coins: '30 / 60 Coins' },
    { service: 'Motion Control (Kling)', endpoint: 'POST /api/genai/motion-control', resolution: 'Standard Mode', unit: 'per 5 seconds', points: '2,000 Pts', pointsWithRef: '-', coins: '5 Coins' },
    { service: 'Motion Control (Kling)', endpoint: 'POST /api/genai/motion-control', resolution: 'Pro Mode (1080p) ⭐', unit: 'per 5 seconds', points: '2,500 Pts', pointsWithRef: '-', coins: '6 Coins' },
  ],
  avatar: [
    { service: 'OmniHuman Avatar ⭐', endpoint: 'POST /api/genai/byteplus/avatar-video', resolution: 'HD / 1080p', unit: 'per 5 seconds of audio', points: '4,000 Pts / 5s', coins: '8 Coins / 5s' },
    { service: 'InfiniteTalk', endpoint: 'POST /api/genai/infinitetalk', resolution: '480p', unit: 'per 5 seconds of audio', points: '1,000 Pts', coins: '2 Coins' },
    { service: 'InfiniteTalk', endpoint: 'POST /api/genai/infinitetalk', resolution: '720p HD', unit: 'per 5 seconds of audio', points: '2,000 Pts', coins: '4 Coins' },
    { service: 'InfiniteTalk', endpoint: 'POST /api/genai/infinitetalk', resolution: '1080p FHD ⭐', unit: 'per 5 seconds of audio', points: '3,000 Pts', coins: '6 Coins' },
    { service: 'DreamActor', endpoint: 'POST /api/genai/byteplus/dreamactor', resolution: 'Body Motion', unit: 'per second (Pts) / 5 sec (Coin)', points: '100 Pts / second', coins: '1 Coin / 5 sec' },
  ],
  image: [
    { service: 'SeeDream 4.5', endpoint: 'POST /api/genai/byteplus/image-generation', resolution: 'Standard HD', unit: 'per image', points: '200 Pts', coins: '1 Coin' },
    { service: 'GPT Image (Text to Image)', endpoint: 'POST /api/genai/wavespeed/gpt-image/text-to-image', resolution: 'Standard', unit: 'per image', points: '500 Pts', coins: '2 Coins' },
    { service: 'GPT Image (Text to Image)', endpoint: 'POST /api/genai/wavespeed/gpt-image/text-to-image', resolution: 'HD 1080p ⭐', unit: 'per image', points: '1,000 Pts', coins: '4 Coins' },
    { service: 'GPT Image Edit', endpoint: 'POST /api/genai/wavespeed/gpt-image/edit', resolution: 'Standard', unit: 'per image', points: '500 Pts', coins: '2 Coins' },
    { service: 'GPT Image Edit', endpoint: 'POST /api/genai/wavespeed/gpt-image/edit', resolution: 'HD 1080p ⭐', unit: 'per image', points: '1,000 Pts', coins: '4 Coins' },
    { service: 'Upload Image', endpoint: 'POST /api/genai/upload_image', resolution: 'Asset Upload', unit: 'per file', points: '✓ Free', coins: '✓ Free' },
  ],
  voice: [
    { service: 'Botnoi Voice (TTS)', endpoint: 'POST /openapi/v1/generate_audio', resolution: 'TTS V1, V2, V4 Studio', unit: 'per character', points: '1 Point / character', coins: '' },
    { service: 'Botnoi ASR', endpoint: 'GET /api/genai/ws/asr', resolution: 'Real-time WebSocket', unit: 'per second of audio', points: '2 Points / second', coins: '' },
  ],
  free: [
    { service: 'Check Seedance 2.5, Motion Control, InfiniteTalk, and GPT Image results', endpoint: 'GET /api/genai/wavespeed/result/{id}', resolution: '', unit: '', points: '✓ Free', coins: '✓ Free' },
    { service: 'Check SeeDance 2.0 status', endpoint: 'GET /api/genai/byteplus/video-generation/{task_id}', resolution: '', unit: '', points: '✓ Free', coins: '✓ Free' },
    { service: 'Check OmniHuman Avatar status', endpoint: 'GET /api/genai/byteplus/avatar-video/{task_id}', resolution: '', unit: '', points: '✓ Free', coins: '✓ Free' },
    { service: 'Retrieve user details and balances', endpoint: 'GET /api/dashboard/get_profile', resolution: '', unit: '', points: '✓ Free', coins: '✓ Free' },
  ],
}

function PricingDropdown({ id, label, value, options, onChange }: {
  id: string
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value))
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  const openAt = (index: number) => {
    setOpen(true)
    requestAnimationFrame(() => optionRefs.current[index]?.focus())
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const activeIndex = optionRefs.current.findIndex(option => option === document.activeElement)
    const currentIndex = activeIndex < 0 ? selectedIndex : activeIndex
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length
    if (!open) setOpen(true)
    requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus())
  }

  return (
    <div className="pricing-dropdown" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        id={id}
        ref={triggerRef}
        className="pricing-dropdown-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => open ? setOpen(false) : openAt(selectedIndex)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openAt(selectedIndex)
          }
        }}
      >
        <span>{selectedOption?.label}</span>
        <svg className="pricing-dropdown-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {open && (
        <div className="pricing-dropdown-menu" id={`${id}-options`} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={element => { optionRefs.current[index] = element }}
              className={`pricing-dropdown-option${option.value === value ? ' is-selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const { t, language } = useLanguage()

  const [calcModel, setCalcModel] = useState('seedance25')
  const [calcDuration, setCalcDuration] = useState('5')
  const [calcResolution, setCalcResolution] = useState('1080p')
  const [calcRefVideo, setCalcRefVideo] = useState('no')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [resultBlocks, setResultBlocks] = useState('1 block (5s)')
  const [resultPoints, setResultPoints] = useState('20,000 Pts')
  const [resultCoins, setResultCoins] = useState('40 Coins')

  const isImageModel = calcModel === 'seedream' || calcModel === 'gptimage'
  const isTtsModel = calcModel === 'tts'
  const showDuration = !isImageModel
  const showResolution = calcModel === 'gptimage' || (!isImageModel && !isTtsModel)
  const showRefVideo = calcModel === 'seedance25' || calcModel === 'seedance20'
  const parsedDuration = Number(calcDuration)
  const isDurationInvalid = showDuration && (calcDuration.trim() === '' || !Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 300)

  useEffect(() => {
    const previousTitle = document.title
    document.title = t('API pricing and video duration guide')
    return () => { document.title = previousTitle }
  }, [t])

  useEffect(() => {
    if (isDurationInvalid) {
      setResultBlocks('—')
      setResultPoints('—')
      setResultCoins('—')
      return
    }
    const duration = parsedDuration
    let blocks = Math.ceil(duration / 5.0)
    if (blocks < 1) blocks = 1
    let points = 0
    let coins = 0
    let blocksLabel = `${blocks} ${t(blocks === 1 ? 'block' : 'blocks')} (${blocks * 5} ${t('sec')})`
    const hasRef = calcRefVideo === 'yes'

    if (calcModel === 'seedance25') {
      const mult = calcResolution === '4k' ? 10 : calcResolution === '1080p' ? 5 : calcResolution === '720p' ? 2 : 1
      points = blocks * 4000 * mult * (hasRef ? 2 : 1)
      coins = blocks * 8 * mult * (hasRef ? 2 : 1)
    } else if (calcModel === 'seedance20') {
      const mult = calcResolution === '4k' ? 10 : calcResolution === '1080p' ? 5 : calcResolution === '720p' ? 2 : 1
      points = blocks * 3000 * mult * (hasRef ? 2 : 1)
      coins = blocks * 6 * mult * (hasRef ? 2 : 1)
    } else if (calcModel === 'omnihuman') {
      points = blocks * 4000; coins = blocks * 8
    } else if (calcModel === 'infinitetalk') {
      const mult = calcResolution === '1080p' ? 3 : calcResolution === '720p' ? 2 : 1
      points = blocks * 1000 * mult; coins = blocks * 2 * mult
    } else if (calcModel === 'kling') {
      const isPro = calcResolution === '1080p' || calcResolution === '4k'
      points = blocks * (isPro ? 2500 : 2000); coins = blocks * (isPro ? 6 : 5)
    } else if (calcModel === 'seedream') {
      points = 200; coins = 1; blocksLabel = `1 ${t('image')}`
    } else if (calcModel === 'gptimage') {
      const isHd = calcResolution === '1080p' || calcResolution === '4k'
      points = isHd ? 1000 : 500; coins = isHd ? 4 : 2; blocksLabel = `1 ${t('image')}`
    } else if (calcModel === 'tts') {
      points = Math.round(duration); coins = Math.ceil(duration / 100)
      blocksLabel = `${duration} ${t('characters')}`
    }

    setResultBlocks(blocksLabel)
    setResultPoints(`${points.toLocaleString()} ${t('Points')}`)
    setResultCoins(`${coins.toLocaleString()} ${t('Coins')}`)
  }, [calcModel, calcDuration, calcResolution, calcRefVideo, isDurationInvalid, parsedDuration, t])

  const categories = [
    { key: 'all', label: t('All') },
    { key: 'video', label: t('Video Models') },
    { key: 'avatar', label: t('Avatars') },
    { key: 'image', label: t('Images') },
    { key: 'voice', label: t('Voice TTS') },
    { key: 'free', label: t('Free polling') },
    { key: 'package', label: t('Packages') },
  ]

  const sections: { key: string; label: string }[] = [
    { key: 'video', label: t('Video generation models') },
    { key: 'avatar', label: t('Talking avatars and lip-sync') },
    { key: 'image', label: t('Image generation') },
    { key: 'voice', label: t('Voice and speech') },
    { key: 'free', label: t('Free result and polling APIs') },
    { key: 'package', label: t('API pricing packages') },
  ]

  const rowMatchesSearch = (row: PricingRow) => {
    const query = search.trim().toLocaleLowerCase()
    return query === '' || Object.values(row).some(value =>
      typeof value === 'string' && (value.toLocaleLowerCase().includes(query) || t(value).toLocaleLowerCase().includes(query)),
    )
  }

  const visiblePricingRows = Object.fromEntries(
    Object.entries(pricingRows).map(([key, rows]) => [key, rows.filter(rowMatchesSearch)]),
  ) as Record<keyof typeof pricingRows, PricingRow[]>

  const showSection = (key: string) =>
    (filter === 'all' || filter === key) &&
    (search.trim() === '' || (key !== 'package' && visiblePricingRows[key as keyof typeof pricingRows].length > 0))

  const hasVisibleSearchResults = Object.entries(visiblePricingRows).some(([key, rows]) =>
    (filter === 'all' || filter === key) && rows.length > 0,
  )

  const localizePrice = (value: string) => language === 'th'
    ? value
      .replace(/\bPts\b/g, t('Points'))
      .replace(/\bPoints\b/g, t('Points'))
      .replace(/\bPoint\b/g, t('Points'))
      .replace(/\bCoins?\b/g, coin => t(coin === 'Coin' ? 'Coin' : 'Coins'))
    : value

  return (
    <main className="pricing-page">
      <div className="pricing-container">

        <header className="pricing-header">
          <h1 className="pricing-title">{t('API pricing and video duration guide')}</h1>
          <p className="pricing-subtitle">
            {t('Compare API prices across resolutions, with examples for calculating video duration.')}
          </p>
        </header>

        {/* Duration Guide */}
        <div className="pricing-guide-card">
          <div className="pricing-guide-header">
            <div className="pricing-guide-title">{t('How video and audio duration is priced')}</div>
          </div>
          <p className="pricing-guide-intro">
            {t('Video generation and talking avatar services are priced in 5-second blocks, rounded up:')}
          </p>
          <div className="pricing-blocks-grid">
            {[['0.1–5.0 seconds','1 block'],['5.1–10.0 seconds','2 blocks'],['10.1–15.0 seconds','3 blocks'],['15.1–20.0 seconds','4 blocks'],['20.1–25.0 seconds','5 blocks'],['25.1–30.0 seconds','6 blocks']].map(([sec, count]) => (
              <div key={sec} className="pricing-block-step">
                <div className="pricing-block-sec">{t(sec)}</div>
                <div className="pricing-block-count">{t(count)}</div>
              </div>
            ))}
          </div>
          <div className="pricing-example-box">
            <strong>💡 {t('Pricing examples')}:</strong><br />
            • <strong>{t('5 seconds')}</strong> Seedance 2.5 (1080p) → 1 {t('block')} = <strong>20,000 {t('Points')}</strong><br />
            • <strong>{t('7 seconds')}</strong> OmniHuman → {t('rounds up to 2 blocks')} = <strong>8,000 {t('Points')}</strong><br />
            • {t('With a reference video, the price is doubled.')}
          </div>
        </div>

        {/* Calculator */}
        <div className="pricing-calc-card">
          <div className="pricing-calc-header">
            <div className="pricing-calc-title">{t('Try the price calculator')}</div>
          </div>
          <div className="pricing-calc-grid">
            <div className="pricing-calc-field">
              <label htmlFor="pricing-model-select">{t('Model / service:')}</label>
              <PricingDropdown id="pricing-model-select" label={t('Model / service:')} value={calcModel} onChange={setCalcModel} options={[
                { value: 'seedance25', label: t('Seedance 2.5 video') },
                { value: 'seedance20', label: t('SeeDance 2.0 video') },
                { value: 'omnihuman', label: t('OmniHuman talking avatar') },
                { value: 'infinitetalk', label: t('InfiniteTalk avatar') },
                { value: 'kling', label: t('Motion Control') },
                { value: 'seedream', label: t('SeeDream 4.5 image') },
                { value: 'gptimage', label: t('GPT Image') },
                { value: 'tts', label: t('Botnoi Voice text to speech') },
              ]} />
            </div>
            {showDuration && (
              <div className="pricing-calc-field">
                <label htmlFor="pricing-duration-input">{isTtsModel ? t('Number of characters:') : t('Duration (seconds):')}</label>
                <input id="pricing-duration-input" type="number" value={calcDuration} min={1} max={300} step={1} required aria-invalid={isDurationInvalid} aria-describedby={isDurationInvalid ? 'pricing-duration-error' : undefined} onChange={e => setCalcDuration(e.target.value)} />
                {isDurationInvalid && <div className="pricing-field-error" id="pricing-duration-error" role="alert">{t('Enter a whole number from 1 to 300.')}</div>}
              </div>
            )}
            {showResolution && (
              <div className="pricing-calc-field">
                <label htmlFor="pricing-resolution-select">{t('Resolution:')}</label>
                <PricingDropdown id="pricing-resolution-select" label={t('Resolution:')} value={calcResolution} onChange={setCalcResolution} options={[
                  { value: '480p', label: t('480p · Standard') },
                  { value: '720p', label: t('720p · HD') },
                  { value: '1080p', label: t('1080p · Full HD ⭐') },
                  { value: '4k', label: t('4K · Ultra HD') },
                ]} />
              </div>
            )}
            {showRefVideo && (
              <div className="pricing-calc-field">
                <label htmlFor="pricing-reference-video-select">{t('Reference video:')}</label>
                <PricingDropdown id="pricing-reference-video-select" label={t('Reference video:')} value={calcRefVideo} onChange={setCalcRefVideo} options={[
                  { value: 'no', label: t('No') },
                  { value: 'yes', label: t('Yes · double the price') },
                ]} />
              </div>
            )}
          </div>
          <div className="pricing-calc-result">
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('Billable duration')}</div>
              <div className="pricing-stat-val pricing-val-blocks">{resultBlocks}</div>
            </div>
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('Points charged')}</div>
              <div className="pricing-stat-val pricing-val-points">{resultPoints}</div>
            </div>
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('Coins charged')}</div>
              <div className="pricing-stat-val pricing-val-coins">{resultCoins}</div>
            </div>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="pricing-controls">
          <div className="pricing-filter-pills">
            {categories.map(c => (
              <button key={c.key} type="button" aria-pressed={filter === c.key} className={`pricing-filter-btn${filter === c.key ? ' active' : ''}`} onClick={() => setFilter(c.key)}>{c.label}</button>
            ))}
          </div>
          <div className="pricing-search-box">
            <input id="pricing-search" type="text" aria-label={t('Search APIs, endpoints, resolutions…')} placeholder={t('Search APIs, endpoints, resolutions…')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {search.trim() !== '' && !hasVisibleSearchResults && (
          <div className="pricing-search-empty" role="status">{t('No matching APIs found. Try another model, endpoint, or resolution.')}</div>
        )}

        {/* Tables */}
        {sections.map(sec => showSection(sec.key) && (
          <div key={sec.key} className="pricing-section-card">
            <div className="pricing-section-header">
              <div className="pricing-section-title">{sec.label}</div>
            </div>
            <div className="pricing-table-wrap">
              {sec.key === 'video' && (
                <table className="pricing-table">
                  <thead><tr><th>{t('Service / endpoint')}</th><th>{t('Resolution')}</th><th>{t('Duration')}</th><th>{t('Price without reference video')}</th><th>{t('Price with reference video (×2)')}</th><th>{t('Coin rate')}</th></tr></thead>
                  <tbody>
                    {visiblePricingRows.video.map(r => (
                      <tr key={`${r.service}-${r.resolution}`}>
                        <td data-label={t('Service / endpoint')}><span className="pricing-api-name">{r.service}</span><span className="pricing-api-endpoint">{r.endpoint}</span></td>
                        <td data-label={t('Resolution')}><span className="pricing-res-tag">{t(r.resolution)}</span></td>
                        <td data-label={t('Duration')}><span className="pricing-time-badge">{t(r.unit)}</span></td>
                        <td data-label={t('Price without reference video')}><span className="pricing-point-val">{localizePrice(r.points)}</span></td>
                        <td data-label={t('Price with reference video (×2)')}><span className="pricing-point-val">{localizePrice(r.pointsWithRef ?? '-')}</span></td>
                        <td data-label={t('Coin rate')}><span className="pricing-coin-val">{localizePrice(r.coins)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'avatar' && (
                <table className="pricing-table">
                  <thead><tr><th>{t('Service / endpoint')}</th><th>{t('Resolution / mode')}</th><th>{t('Duration unit')}</th><th>{t('Price in points')}</th><th>{t('Price in coins')}</th></tr></thead>
                  <tbody>
                    {visiblePricingRows.avatar.map(r => (
                      <tr key={`${r.service}-${r.resolution}`}>
                        <td data-label={t('Service / endpoint')}><span className="pricing-api-name">{r.service}</span><span className="pricing-api-endpoint">{r.endpoint}</span></td>
                        <td data-label={t('Resolution / mode')}><span className="pricing-res-tag">{t(r.resolution)}</span></td>
                        <td data-label={t('Duration unit')}><span className="pricing-time-badge">{t(r.unit)}</span></td>
                        <td data-label={t('Price in points')}><span className="pricing-point-val">{localizePrice(r.points)}</span></td>
                        <td data-label={t('Price in coins')}><span className="pricing-coin-val">{localizePrice(r.coins)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'image' && (
                <table className="pricing-table">
                  <thead><tr><th>{t('Service / endpoint')}</th><th>{t('Resolution')}</th><th>{t('Pricing unit')}</th><th>{t('Price in points')}</th><th>{t('Price in coins')}</th></tr></thead>
                  <tbody>
                    {visiblePricingRows.image.map(r => (
                      <tr key={`${r.service}-${r.resolution}`}>
                        <td data-label={t('Service / endpoint')}><span className="pricing-api-name">{r.service}</span><span className="pricing-api-endpoint">{r.endpoint}</span></td>
                        <td data-label={t('Resolution')}><span className="pricing-res-tag">{t(r.resolution)}</span></td>
                        <td data-label={t('Pricing unit')}><span className="pricing-time-badge">{t(r.unit)}</span></td>
                        <td data-label={t('Price in points')}><span className="pricing-point-val">{localizePrice(r.points)}</span></td>
                        <td data-label={t('Price in coins')}><span className="pricing-coin-val">{localizePrice(r.coins)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'voice' && (
                <table className="pricing-table">
                  <thead><tr><th>{t('Service / endpoint')}</th><th>{t('Version / type')}</th><th>{t('Pricing unit')}</th><th>{t('Price in points')}</th></tr></thead>
                  <tbody>
                    {visiblePricingRows.voice.map((r, i) => (
                      <tr key={i}>
                        <td data-label={t('Service / endpoint')}><span className="pricing-api-name">{r.service}</span><span className="pricing-api-endpoint">{r.endpoint}</span></td>
                        <td data-label={t('Version / type')}>{t(r.resolution)}</td>
                        <td data-label={t('Pricing unit')}><span className="pricing-time-badge">{t(r.unit)}</span></td>
                        <td data-label={t('Price in points')}><span className="pricing-point-val">{localizePrice(r.points)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'free' && (
                <table className="pricing-table">
                  <thead><tr><th>{t('API / endpoint')}</th><th>{t('Description')}</th><th>{t('Price in points')}</th><th>{t('Price in coins')}</th></tr></thead>
                  <tbody>
                    {visiblePricingRows.free.map((r, i) => (
                      <tr key={i}>
                        <td data-label={t('API / endpoint')}><span className="pricing-api-endpoint">{r.endpoint}</span></td>
                        <td data-label={t('Description')}>{t(r.service)}</td>
                        <td data-label={t('Price in points')}><span className="pricing-free-val">{t(r.points)}</span></td>
                        <td data-label={t('Price in coins')}><span className="pricing-free-val">{t(r.coins)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'package' && (
                <>
                  <div className="pricing-pkg-grid">
                    {[
                      { name: 'Starter', price: '199', points: '500,000', coins: '1,000', note: 'For trying the service', popular: false },
                      { name: 'Standard', price: '499', points: '1,500,000', coins: '3,000', note: 'For regular use', popular: false },
                      { name: 'Pro', price: '999', points: '3,500,000', coins: '7,000', note: 'Save about 16% compared with Standard', popular: true },
                      { name: 'Business', price: '2,499', points: '10,000,000', coins: '20,000', note: 'For organizations and larger teams', popular: false },
                    ].map(pkg => (
                      <div key={pkg.name} className={`pricing-pkg-card${pkg.popular ? ' is-popular' : ''}`}>
                        {pkg.popular && <div className="pricing-pkg-popular-badge">{t('Most popular')}</div>}
                        <div className="pricing-pkg-name">{t(pkg.name)}</div>
                        <div>
                          <div className="pricing-pkg-price">฿{pkg.price}</div>
                          <div className="pricing-pkg-price-unit">{t('one-time purchase')}</div>
                        </div>
                        <hr className="pricing-pkg-divider" />
                        <ul className="pricing-pkg-features">
                          <li><strong>{pkg.points}</strong> {t('Points')}</li>
                          <li><strong>{pkg.coins}</strong> {t('Coins')}</li>
                        </ul>
                        <div className="pricing-pkg-note">{t(pkg.note)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pricing-package-notes">
                    <div className="pricing-example-box">
                      <strong>💱 {t('Points and coins exchange rate:')}</strong><br />
                      • <strong>500 {t('Points')}</strong> = 1 {t('Coin')} &nbsp;|&nbsp; <strong>1 {t('Coin')}</strong> = 500 {t('Points')}<br />
                      • {t('Purchased packages can be used with every API in the system.')}
                    </div>
                    <div className="pricing-example-box">
                      <strong>📊 {t('Pro package examples:')}</strong><br />
                      • Seedance 2.5 (1080p, 5s): <strong>175 {t('videos')}</strong><br />
                      • OmniHuman Avatar (5s): <strong>875 {t('videos')}</strong><br />
                      • TTS: <strong>3,500,000 {t('characters')}</strong>
                    </div>
                  </div>
                  <div className="pricing-package-action">
                    <a href="https://voice.botnoi.ai" target="_blank" rel="noopener noreferrer">{t('Open Botnoi Voice')}<span aria-hidden="true">↗</span></a>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <footer className="pricing-footer">
          <p>{t('© 2026 Botnoi Voice & GenAI Platform · Official API pricing summary for teams')}</p>
        </footer>
      </div>
    </main>
  )
}

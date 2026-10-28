import { useState, useEffect } from 'react'
import { useLanguage } from '../functions/LanguageProvider'
import './PricingPage.css'

export default function PricingPage() {
  const { t } = useLanguage()

  const [calcModel, setCalcModel] = useState('seedance25')
  const [calcDuration, setCalcDuration] = useState(5)
  const [calcResolution, setCalcResolution] = useState('1080p')
  const [calcRefVideo, setCalcRefVideo] = useState('no')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [resultBlocks, setResultBlocks] = useState('1 บล็อก (5s)')
  const [resultPoints, setResultPoints] = useState('20,000 Pts')
  const [resultCoins, setResultCoins] = useState('40 Coins')

  const isImageModel = calcModel === 'seedream' || calcModel === 'gptimage'
  const isTtsModel = calcModel === 'tts'
  const showDuration = !isImageModel
  const showResolution = calcModel === 'gptimage' || (!isImageModel && !isTtsModel)
  const showRefVideo = calcModel === 'seedance25' || calcModel === 'seedance20'

  useEffect(() => {
    const duration = Math.max(1, calcDuration || 1)
    let blocks = Math.ceil(duration / 5.0)
    if (blocks < 1) blocks = 1
    let points = 0
    let coins = 0
    let blocksLabel = `${blocks} บล็อก (${blocks * 5}s)`
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
      points = 200; coins = 1; blocksLabel = '1 รูปภาพ'
    } else if (calcModel === 'gptimage') {
      const isHd = calcResolution === '1080p' || calcResolution === '4k'
      points = isHd ? 1000 : 500; coins = isHd ? 4 : 2; blocksLabel = '1 รูปภาพ'
    } else if (calcModel === 'tts') {
      points = Math.round(duration); coins = Math.ceil(duration / 100)
      blocksLabel = `${duration} ตัวอักษร`
    }

    setResultBlocks(blocksLabel)
    setResultPoints(points.toLocaleString() + ' Pts')
    setResultCoins(coins.toLocaleString() + ' Coins')
  }, [calcModel, calcDuration, calcResolution, calcRefVideo])

  const categories = [
    { key: 'all', label: t('ทั้งหมด (All)') },
    { key: 'video', label: 'Video Models' },
    { key: 'avatar', label: 'Avatars' },
    { key: 'image', label: 'Images' },
    { key: 'voice', label: 'Voice TTS' },
    { key: 'free', label: t('ฟรี (Polling)') },
    { key: 'package', label: t('แพ็คเกจ') },
  ]

  const sections: { key: string; label: string; icon: string }[] = [
    { key: 'video', label: t('Video Generation Models (โมเดลสร้างวิดีโอ)'), icon: '🎬' },
    { key: 'avatar', label: t('Talking Avatars & Lip-sync (สร้างอวตารพูดได้)'), icon: '🗣️' },
    { key: 'image', label: t('Image Generation (สร้างและแก้ไขภาพ AI)'), icon: '🖼️' },
    { key: 'voice', label: t('Voice & Speech (เสียงพากย์และถอดเสียง)'), icon: '🎙️' },
    { key: 'free', label: t('Query Result & Polling (เช็คผลลัพธ์ฟรีทั้งหมด)'), icon: '🔄' },
    { key: 'package', label: t('แพ็คเกจราคา — อัตราค่าบริการ API'), icon: '📦' },
  ]

  const showSection = (key: string) =>
    (filter === 'all' || filter === key) &&
    (search === '' || key === 'package')

  const rowMatchesSearch = (text: string) =>
    search === '' || text.toLowerCase().includes(search.toLowerCase())

  return (
    <main className="pricing-page">
      <div className="pricing-container">

        <header className="pricing-header">
          <div className="pricing-badge">⚡ Botnoi AI Gateway API Documentation</div>
          <h1 className="pricing-title">{t('อัตราค่าบริการ API และคู่มือการคิดเวลาคลิป')}</h1>
          <p className="pricing-subtitle">
            {t('ตารางสรุปราคาฉบับอ่านง่าย ครบถ้วนทุกความละเอียด (480p, 720p, 1080p, 4K) พร้อมตัวอย่างการคำนวณความยาวคลิป')}
          </p>
        </header>

        {/* Duration Guide */}
        <div className="pricing-guide-card">
          <div className="pricing-guide-header">
            <span style={{ fontSize: '1.6rem' }}>⏱️</span>
            <div className="pricing-guide-title">{t('ความยาวคลิป / ความยาวเสียง คิดราคายังไง? (Duration Calculation)')}</div>
          </div>
          <p className="pricing-guide-intro">
            {t('สำหรับโมเดลประเภท Video Generation และ Talking Avatar ระบบจะคิดราคาเป็น บล็อกละ 5 วินาที (ปัดเศษขึ้นเสมอ):')}
          </p>
          <div className="pricing-blocks-grid">
            {[['0.1 – 5.0 วินาที','1 บล็อก'],['5.1 – 10.0 วินาที','2 บล็อก'],['10.1 – 15.0 วินาที','3 บล็อก'],['15.1 – 20.0 วินาที','4 บล็อก'],['25.1 – 30.0 วินาที','6 บล็อก']].map(([sec, count]) => (
              <div key={sec} className="pricing-block-step">
                <div className="pricing-block-sec">{sec}</div>
                <div className="pricing-block-count">{count}</div>
              </div>
            ))}
          </div>
          <div className="pricing-example-box">
            <strong>💡 ตัวอย่างการคำนวณจริง:</strong><br />
            • <strong>5 วินาที</strong> Seedance 2.5 (1080p) → 1 บล็อก = <strong>20,000 Points</strong><br />
            • <strong>7 วินาที</strong> OmniHuman → ปัดเป็น 2 บล็อก = <strong>8,000 Points</strong><br />
            • มี <strong>Reference Video</strong> คิดราคา <strong>x2</strong> เสมอ
          </div>
        </div>

        {/* Calculator */}
        <div className="pricing-calc-card">
          <div className="pricing-calc-header">
            <span style={{ fontSize: '1.4rem' }}>🧮</span>
            <div className="pricing-calc-title">{t('เครื่องมือทดลองคำนวณราคาอัตโนมัติ (Live Price Calculator)')}</div>
          </div>
          <div className="pricing-calc-grid">
            <div className="pricing-calc-field">
              <label>{t('เลือกโมเดล / บริการ:')}</label>
              <select value={calcModel} onChange={e => setCalcModel(e.target.value)}>
                <option value="seedance25">Seedance 2.5 (Video)</option>
                <option value="seedance20">SeeDance 2.0 (Video)</option>
                <option value="omnihuman">OmniHuman (Talking Avatar)</option>
                <option value="infinitetalk">InfiniteTalk (Avatar)</option>
                <option value="kling">Motion Control (Kling)</option>
                <option value="seedream">SeeDream 4.5 (Image)</option>
                <option value="gptimage">GPT Image (Image)</option>
                <option value="tts">Botnoi Voice (TTS)</option>
              </select>
            </div>
            {showDuration && (
              <div className="pricing-calc-field">
                <label>{isTtsModel ? t('จำนวนตัวอักษร:') : t('ความยาว (วินาที):')}</label>
                <input type="number" value={calcDuration} min={1} max={300} onChange={e => setCalcDuration(Number(e.target.value))} />
              </div>
            )}
            {showResolution && (
              <div className="pricing-calc-field">
                <label>{t('ความละเอียด (Resolution):')}</label>
                <select value={calcResolution} onChange={e => setCalcResolution(e.target.value)}>
                  <option value="480p">480p (Standard)</option>
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD ⭐)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>
            )}
            {showRefVideo && (
              <div className="pricing-calc-field">
                <label>{t('มี Reference Video ไหม?')}</label>
                <select value={calcRefVideo} onChange={e => setCalcRefVideo(e.target.value)}>
                  <option value="no">ไม่มี (No)</option>
                  <option value="yes">มี Reference Video (x2)</option>
                </select>
              </div>
            )}
          </div>
          <div className="pricing-calc-result">
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('จำนวนบล็อกเวลาที่คิด')}</div>
              <div className="pricing-stat-val pricing-val-blocks">{resultBlocks}</div>
            </div>
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('ยอดหัก Points (Credits)')}</div>
              <div className="pricing-stat-val pricing-val-points">{resultPoints}</div>
            </div>
            <div className="pricing-calc-stat">
              <div className="pricing-stat-label">{t('ยอดหัก Coins (Free Plan)')}</div>
              <div className="pricing-stat-val pricing-val-coins">{resultCoins}</div>
            </div>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="pricing-controls">
          <div className="pricing-filter-pills">
            {categories.map(c => (
              <button key={c.key} className={`pricing-filter-btn${filter === c.key ? ' active' : ''}`} onClick={() => setFilter(c.key)}>{c.label}</button>
            ))}
          </div>
          <div className="pricing-search-box">
            <input type="text" placeholder={`🔍 ${t('ค้นหา API, Endpoint, 1080p...')}`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Tables */}
        {sections.map(sec => showSection(sec.key) && (
          <div key={sec.key} className="pricing-section-card">
            <div className="pricing-section-header">
              <span style={{ fontSize: '1.3rem' }}>{sec.icon}</span>
              <div className="pricing-section-title">{sec.label}</div>
            </div>
            <div className="pricing-table-wrap">
              {sec.key === 'video' && (
                <table className="pricing-table">
                  <thead><tr><th>บริการ / Endpoint</th><th>ความละเอียด</th><th>ความยาว</th><th>ราคา: ไม่มี Ref Video</th><th>ราคา: มี Ref Video (x2)</th><th>เรท Coin</th></tr></thead>
                  <tbody>
                    {[
                      ['Seedance 2.5','POST /wavespeed/bytedance/seedance-2.5/*','480p','4,000 Pts','8,000 Pts','8 / 16 Coins',false],
                      ['','','720p HD','8,000 Pts','16,000 Pts','16 / 32 Coins',false],
                      ['','','1080p FHD ⭐','20,000 Pts','40,000 Pts','40 / 80 Coins',true],
                      ['','','4K Ultra HD','40,000 Pts','80,000 Pts','80 / 160 Coins',false],
                      ['SeeDance 2.0','POST /api/genai/byteplus/video-generation','480p','3,000 Pts','6,000 Pts','6 / 12 Coins',false],
                      ['','','720p HD','6,000 Pts','12,000 Pts','12 / 24 Coins',false],
                      ['','','1080p FHD ⭐','15,000 Pts','30,000 Pts','30 / 60 Coins',true],
                      ['Motion Control (Kling)','POST /api/genai/motion-control','Standard Mode','2,000 Pts','-','5 Coins',false],
                      ['','','Pro Mode (1080p) ⭐','2,500 Pts','-','6 Coins',true],
                    ].filter(r => rowMatchesSearch(r.join(' '))).map((r, i) => (
                      <tr key={i} style={r[6] ? { background: 'var(--pricing-highlight)' } : {}}>
                        {r[0] ? <td><span className="pricing-api-name">{r[0] as string}</span><span className="pricing-api-endpoint">{r[1] as string}</span></td> : <td />}
                        <td><span className="pricing-res-tag">{r[2] as string}</span></td>
                        <td><span className="pricing-time-badge">ต่อ 5 วินาที</span></td>
                        <td><span className="pricing-point-val">{r[3] as string}</span></td>
                        <td><span className="pricing-point-val">{r[4] as string}</span></td>
                        <td><span className="pricing-coin-val">{r[5] as string}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'avatar' && (
                <table className="pricing-table">
                  <thead><tr><th>บริการ / Endpoint</th><th>ความละเอียด / Mode</th><th>วิธีนับเวลา</th><th>ราคา Points</th><th>ราคา Coins</th></tr></thead>
                  <tbody>
                    {[
                      ['OmniHuman Avatar ⭐','POST /api/genai/byteplus/avatar-video','HD / 1080p','ต่อ 5 วินาทีของไฟล์เสียง','4,000 Pts / 5s','8 Coins / 5s',true],
                      ['InfiniteTalk','POST /api/genai/infinitetalk','480p','ต่อ 5 วินาทีของไฟล์เสียง','1,000 Pts','2 Coins',false],
                      ['','','720p HD','ต่อ 5 วินาทีของไฟล์เสียง','2,000 Pts','4 Coins',false],
                      ['','','1080p FHD ⭐','ต่อ 5 วินาทีของไฟล์เสียง','3,000 Pts','6 Coins',true],
                      ['DreamActor','POST /api/genai/byteplus/dreamactor','Body Motion','ต่อวินาที (Pts) / 5วิ (Coin)','100 Pts / วินาที','1 Coin / 5วิ',false],
                    ].filter(r => rowMatchesSearch(r.join(' '))).map((r, i) => (
                      <tr key={i} style={r[6] ? { background: 'var(--pricing-highlight)' } : {}}>
                        {r[0] ? <td><span className="pricing-api-name">{r[0] as string}</span><span className="pricing-api-endpoint">{r[1] as string}</span></td> : <td />}
                        <td><span className="pricing-res-tag">{r[2] as string}</span></td>
                        <td><span className="pricing-time-badge">{r[3] as string}</span></td>
                        <td><span className="pricing-point-val">{r[4] as string}</span></td>
                        <td><span className="pricing-coin-val">{r[5] as string}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'image' && (
                <table className="pricing-table">
                  <thead><tr><th>บริการ / Endpoint</th><th>ความละเอียด</th><th>หน่วยคิดราคา</th><th>ราคา Points</th><th>ราคา Coins</th></tr></thead>
                  <tbody>
                    {[
                      ['SeeDream 4.5','POST /api/genai/byteplus/image-generation','Standard HD','ต่อ 1 รูปภาพ','200 Pts','1 Coin',false],
                      ['GPT Image (Text to Image)','POST /api/genai/wavespeed/gpt-image/text-to-image','Standard','ต่อ 1 รูปภาพ','500 Pts','2 Coins',false],
                      ['','','HD 1080p ⭐','ต่อ 1 รูปภาพ','1,000 Pts','4 Coins',true],
                      ['GPT Image Edit','POST /api/genai/wavespeed/gpt-image/edit','Standard','ต่อ 1 รูปภาพ','500 Pts','2 Coins',false],
                      ['','','HD 1080p ⭐','ต่อ 1 รูปภาพ','1,000 Pts','4 Coins',true],
                      ['Upload Image','POST /api/genai/upload_image','Asset Upload','ต่อไฟล์','✓ ฟรี','✓ ฟรี',false],
                    ].filter(r => rowMatchesSearch(r.join(' '))).map((r, i) => (
                      <tr key={i} style={r[6] ? { background: 'var(--pricing-highlight)' } : {}}>
                        {r[0] ? <td><span className="pricing-api-name">{r[0] as string}</span><span className="pricing-api-endpoint">{r[1] as string}</span></td> : <td />}
                        <td><span className="pricing-res-tag">{r[2] as string}</span></td>
                        <td><span className="pricing-time-badge">{r[3] as string}</span></td>
                        <td><span className="pricing-point-val">{r[4] as string}</span></td>
                        <td><span className="pricing-coin-val">{r[5] as string}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'voice' && (
                <table className="pricing-table">
                  <thead><tr><th>บริการ / Endpoint</th><th>เวอร์ชัน / ประเภท</th><th>หน่วยคิดราคา</th><th>ราคา Points</th></tr></thead>
                  <tbody>
                    {[
                      ['Botnoi Voice (TTS)','POST /openapi/v1/generate_audio','TTS V1, V2, V4 Studio','ต่อ 1 ตัวอักษร','1 Point / ตัวอักษร'],
                      ['Botnoi ASR','GET /api/genai/ws/asr','Real-time WebSocket','ต่อวินาทีของเสียง','2 Points / วินาที'],
                    ].filter(r => rowMatchesSearch(r.join(' '))).map((r, i) => (
                      <tr key={i}>
                        <td><span className="pricing-api-name">{r[0]}</span><span className="pricing-api-endpoint">{r[1]}</span></td>
                        <td>{r[2]}</td>
                        <td><span className="pricing-time-badge">{r[3]}</span></td>
                        <td><span className="pricing-point-val">{r[4]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'free' && (
                <table className="pricing-table">
                  <thead><tr><th>ชื่อ API & Endpoint</th><th>คำอธิบาย</th><th>ราคา Points</th><th>ราคา Coins</th></tr></thead>
                  <tbody>
                    {[
                      ['GET /api/genai/wavespeed/result/{id}','เช็คผลลัพธ์ Seedance 2.5, Motion Control, InfiniteTalk, GPT Image','✓ ฟรี','✓ ฟรี'],
                      ['GET /api/genai/byteplus/video-generation/{task_id}','เช็คสถานะ SeeDance 2.0','✓ ฟรี','✓ ฟรี'],
                      ['GET /api/genai/byteplus/avatar-video/{task_id}','เช็คสถานะ OmniHuman Avatar','✓ ฟรี','✓ ฟรี'],
                      ['GET /api/dashboard/get_profile','ดึงข้อมูลผู้ใช้และยอดคงเหลือ','✓ ฟรี','✓ ฟรี'],
                    ].filter(r => rowMatchesSearch(r.join(' '))).map((r, i) => (
                      <tr key={i}>
                        <td><span className="pricing-api-endpoint">{r[0]}</span></td>
                        <td>{r[1]}</td>
                        <td><span className="pricing-free-val">{r[2]}</span></td>
                        <td><span className="pricing-free-val">{r[3]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sec.key === 'package' && (
                <>
                  <div className="pricing-pkg-grid">
                    {[
                      { name: 'Starter', price: '199', points: '500,000', coins: '1,000', note: 'เหมาะสำหรับทดลองใช้งาน', popular: false },
                      { name: 'Standard', price: '499', points: '1,500,000', coins: '3,000', note: 'เหมาะสำหรับใช้งานทั่วไป', popular: false },
                      { name: 'Pro', price: '999', points: '3,500,000', coins: '7,000', note: 'ประหยัดกว่า ~16% เมื่อเทียบกับ Standard', popular: true },
                      { name: 'Business', price: '2,499', points: '10,000,000', coins: '20,000', note: 'สำหรับองค์กรและทีมขนาดใหญ่', popular: false },
                    ].map(pkg => (
                      <div key={pkg.name} className={`pricing-pkg-card${pkg.popular ? ' is-popular' : ''}`}>
                        {pkg.popular && <div className="pricing-pkg-popular-badge">Most Popular</div>}
                        <div className="pricing-pkg-name">{pkg.name}</div>
                        <div>
                          <div className="pricing-pkg-price">฿{pkg.price}</div>
                          <div className="pricing-pkg-price-unit">ต่อครั้ง (one-time)</div>
                        </div>
                        <hr className="pricing-pkg-divider" />
                        <ul className="pricing-pkg-features">
                          <li><strong>{pkg.points}</strong> Points</li>
                          <li><strong>{pkg.coins}</strong> Coins</li>
                        </ul>
                        <div className="pricing-pkg-note">{pkg.note}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pricing-package-notes">
                    <div className="pricing-example-box">
                      <strong>💱 อัตราแลกเปลี่ยน Points ↔ Coins:</strong><br />
                      • <strong>500 Points</strong> = 1 Coin &nbsp;|&nbsp; <strong>1 Coin</strong> = 500 Points<br />
                      • ซื้อแพ็คเกจแล้วใช้ได้ทุก API ในระบบ
                    </div>
                    <div className="pricing-example-box">
                      <strong>📊 ตัวอย่างการใช้งาน (Pro Package):</strong><br />
                      • Seedance 2.5 (1080p, 5วิ) ได้ <strong>175 คลิป</strong><br />
                      • OmniHuman Avatar (5วิ) ได้ <strong>875 คลิป</strong><br />
                      • TTS ได้ <strong>3,500,000 ตัวอักษร</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <footer className="pricing-footer">
          <p>© 2026 Botnoi Voice &amp; GenAI Platform · เอกสารสรุปอัตราค่าบริการทางการสำหรับทีมงาน</p>
        </footer>
      </div>
    </main>
  )
}
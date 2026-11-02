import GPTImageForm from '../components/gpt-image/gptimageform'
import '../components/gpt-image/gptimage.css'
import type { RequestPreview } from '../types/app'

interface GPTImagePageProps {
  onPreview: (data: RequestPreview) => void
  onResetPreview?: () => void
  resetSignal: number
}

export default function GPTImagePage({
  onPreview,
  onResetPreview,
  resetSignal,
}: GPTImagePageProps) {
  return (
    <GPTImageForm
      onPreview={onPreview}
      onResetPreview={onResetPreview}
      resetSignal={resetSignal}
    />
  )
}

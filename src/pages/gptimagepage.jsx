import GPTImageForm from '../components/gpt-image/gptimageform'
import '../components/gpt-image/gptimage.css'

export default function GPTImagePage({
  onPreview,
  onResetPreview,
  resetSignal,
}) {
  return (
    <GPTImageForm
      onPreview={onPreview}
      onResetPreview={onResetPreview}
      resetSignal={resetSignal}
    />
  )
}
import GPTImageForm from '../components/gpt-image/gptimageform'

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
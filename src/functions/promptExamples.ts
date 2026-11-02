import promptExamples from '../data/promptExamples.json'

export function getPromptExample(model: string): string {
  const normalized = model.toLowerCase()
  let prompts: string[]

  if (normalized.includes('edit')) prompts = promptExamples.imageEdit
  else if (['avatar', 'talk', 'omnihuman', 'dreamactor'].some(term => normalized.includes(term))) prompts = promptExamples.avatar
  else if (['video', 'seedance', 'kling', 'wan', 'motion'].some(term => normalized.includes(term))) prompts = promptExamples.video
  else if (['image', 'seedream', 'dall-e'].some(term => normalized.includes(term))) prompts = promptExamples.image
  else prompts = promptExamples.generic

  return prompts[Math.floor(Math.random() * prompts.length)] ?? promptExamples.generic[0]!
}

interface Props {
  features: string[]
}

export function FeatureList({ features }: Props) {
  return (
    <ul className="space-y-2">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
          <span className="text-amber-400 mt-0.5 flex-shrink-0">✓</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}

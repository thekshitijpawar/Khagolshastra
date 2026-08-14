'use client'

interface CategoryTagProps {
  name: string
}

export default function CategoryTag({ name }: CategoryTagProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent">
      {name}
    </span>
  )
}

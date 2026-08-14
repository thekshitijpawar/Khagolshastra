'use client'

import { Article } from '@/types'

interface EditorialQueueProps {
  items: Article[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export default function EditorialQueue({ items, onApprove, onReject }: EditorialQueueProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-caption-gray">No pending articles in the editorial queue.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-rule-gray">
      <table className="w-full">
        <thead>
          <tr className="border-b border-rule-gray">
            <th className="text-left py-3 text-caption text-mute-gray font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-helvetica-neue)' }}>
              Title
            </th>
            <th className="text-left py-3 text-caption text-mute-gray font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-helvetica-neue)' }}>
              Source
            </th>
            <th className="text-left py-3 text-caption text-mute-gray font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-helvetica-neue)' }}>
              Category
            </th>
            <th className="text-right py-3 text-caption text-mute-gray font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-helvetica-neue)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule-gray">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-broadsheet-white transition-colors">
              <td className="py-4 pr-4">
                <div className="text-body text-folio-black font-medium">{item.title}</div>
                <div className="text-caption text-mute-gray mt-1 line-clamp-1">{item.summary}</div>
              </td>
              <td className="py-4 px-4 text-body text-caption-gray">{item.sourceName || '-'}</td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-2">
                  {item.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="eyebrow">{cat}</span>
                  ))}
                </div>
              </td>
              <td className="py-4 pl-4 text-right">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => onApprove(item.id)}
                    className="px-4 py-2 bg-folio-black text-broadsheet-white text-caption font-bold uppercase tracking-widest hover:bg-charcoal transition-colors"
                    style={{ fontFamily: 'var(--font-helvetica-neue)' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(item.id)}
                    className="px-4 py-2 bg-transparent border border-folio-black text-folio-black text-caption font-bold uppercase tracking-widest hover:bg-folio-black hover:text-broadsheet-white transition-colors"
                    style={{ fontFamily: 'var(--font-helvetica-neue)' }}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

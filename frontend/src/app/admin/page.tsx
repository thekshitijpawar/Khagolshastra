'use client'

import { useState, useEffect } from 'react'
import EditorialQueue from '@/components/EditorialQueue'
import { fetchEditorialQueue, approveArticle, rejectArticle, fetchAdminStats } from '@/lib/api'
import { Article } from '@/types'

type Tab = 'queue' | 'sources'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('queue')
  const [queue, setQueue] = useState<Article[]>([])
  const [stats, setStats] = useState({ total_articles: 0, total_sources: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  useEffect(() => {
    loadQueue()
    loadStats()
  }, [])

  const loadQueue = async () => {
    setLoading(true)
    try {
      const items = await fetchEditorialQueue()
      setQueue(items)
    } catch (error) {
      console.error('Failed to load queue', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats', error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveArticle(id)
      setQueue((q) => q.filter((item) => item.id !== id))
      await loadStats()
    } catch (error) {
      console.error('Failed to approve', error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectArticle(id, rejectNote)
      setQueue((q) => q.filter((item) => item.id !== id))
      setRejectId(null)
      setRejectNote('')
      await loadStats()
    } catch (error) {
      console.error('Failed to reject', error)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-rule-gray pb-6">
        <h1 className="text-heading-xl font-normal tracking-tight text-folio-black" style={{ fontFamily: 'var(--font-plantin)' }}>
          Admin Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-rule-gray border border-rule-gray mb-10">
        {[
          { label: 'Total Articles', value: stats.total_articles },
          { label: 'Total Sources', value: stats.total_sources },
          { label: 'Pending', value: stats.pending },
          { label: 'Approved', value: stats.approved },
          { label: 'Rejected', value: stats.rejected },
        ].map((stat) => (
          <div key={stat.label} className="bg-newsprint-cream p-5">
            <div className="text-2xl font-normal text-folio-black mb-1" style={{ fontFamily: 'var(--font-plantin)' }}>
              {stat.value}
            </div>
            <div className="text-caption text-mute-gray uppercase tracking-widest" style={{ fontFamily: 'var(--font-helvetica-neue)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-rule-gray">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-sm uppercase tracking-widest transition-colors border-b-2 -mb-px ${
            activeTab === 'queue'
              ? 'border-folio-black text-folio-black'
              : 'border-transparent text-mute-gray hover:text-caption-gray'
          }`}
          style={{ fontFamily: 'var(--font-helvetica-neue)' }}
        >
          Editorial Queue ({stats.pending})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 px-4 text-sm uppercase tracking-widest transition-colors border-b-2 -mb-px ${
            activeTab === 'sources'
              ? 'border-folio-black text-folio-black'
              : 'border-transparent text-mute-gray hover:text-caption-gray'
          }`}
          style={{ fontFamily: 'var(--font-helvetica-neue)' }}
        >
          Sources
        </button>
      </div>

      {/* Content */}
      {activeTab === 'queue' && (
        <EditorialQueue
          items={queue}
          onApprove={handleApprove}
          onReject={(id) => setRejectId(id)}
        />
      )}

      {activeTab === 'sources' && (
        <div className="border-t border-rule-gray pt-6">
          <p className="text-caption-gray">Source management will be available here.</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-folio-black/50 flex items-center justify-center z-50">
          <div className="bg-newsprint-cream border border-rule-gray p-8 max-w-md w-full mx-4">
            <h3 className="text-heading font-normal tracking-tight text-folio-black mb-4" style={{ fontFamily: 'var(--font-plantin)' }}>
              Reject Article
            </h3>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full px-4 py-3 bg-broadsheet-white border border-rule-gray text-folio-black placeholder-mute-gray focus:outline-none focus:border-folio-black transition-colors mb-4 text-sm"
              style={{ fontFamily: 'var(--font-plantin)' }}
              rows={3}
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setRejectId(null)}
                className="px-6 py-2 text-caption-gray hover:text-folio-black transition-colors uppercase tracking-widest text-sm"
                style={{ fontFamily: 'var(--font-helvetica-neue)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectId)}
                className="px-6 py-2 bg-folio-black text-broadsheet-white text-caption font-bold uppercase tracking-widest hover:bg-charcoal transition-colors"
                style={{ fontFamily: 'var(--font-helvetica-neue)' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

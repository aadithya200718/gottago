'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'
import { RegistrationForm } from '@/components/registration-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">GottaGO</span>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Create your cover</h1>
        <p className="text-text-secondary text-sm mt-1">Takes 2 minutes. Covered for the entire week.</p>
      </div>
      <RegistrationForm />
    </div>
  )
}

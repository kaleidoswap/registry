import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '/logo.svg'
import fullLogo from './assets/full-logo.svg'
import { siGithub, siReadthedocs, siX, siTelegram } from 'simple-icons'

type Network = 'signet'

type ApiError = {
  message: string;
  code?: string;
  details?: string;
}

interface Asset {
  asset_id: string
  asset_iface: string
  ticker: string
  name: string
  precision: number
  issued_supply: number
  is_active: boolean
  balance: {
    settled: number
    future: number
    spendable: number
    offchain_outbound: number
    offchain_inbound: number
  }
}

interface Pair {
  id: string
  base_asset: string
  base_asset_id: string
  quote_asset: string
  quote_asset_id: string
  is_active: boolean
  min_order_size: number
  max_order_size: number
  price_precision: number
  quantity_precision: number
}

const API_ENDPOINTS = {
  signet: 'https://api.signet.kaleidoswap.com'
}

function Registry() {
  const { network = 'signet' } = useParams<{ network?: Network }>()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [pairFilter, setPairFilter] = useState('')
  const [sortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const { data: assetsData, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['assets', network],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS[network as Network]}/api/v1/market/assets`)
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw {
            message: 'Failed to fetch assets',
            code: error.code,
            details: error.response?.data?.message || error.message
          } as ApiError
        }
        throw new Error('An unexpected error occurred while fetching assets')
      }
    }
  })

  const { data: pairsData, isLoading: isLoadingPairs, error: pairsError } = useQuery({
    queryKey: ['pairs', network],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS[network as Network]}/api/v1/market/pairs`)
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw {
            message: 'Failed to fetch trading pairs',
            code: error.code,
            details: error.response?.data?.message || error.message
          } as ApiError
        }
        throw new Error('An unexpected error occurred while fetching trading pairs')
      }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortData = <T extends Record<string, any>>(data: T[], key: string, direction: 'asc' | 'desc'): T[] => {
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredPairs = pairsData?.pairs.filter((pair: Pair) =>
    `${pair.base_asset}/${pair.quote_asset}`.toLowerCase().includes(pairFilter.toLowerCase()) ||
    pair.base_asset_id.toLowerCase().includes(pairFilter.toLowerCase()) ||
    pair.quote_asset_id.toLowerCase().includes(pairFilter.toLowerCase())
  ) || []

  const sortedPairs = sortConfig && filteredPairs.length > 0
    ? sortData(filteredPairs, sortConfig.key, sortConfig.direction)
    : filteredPairs

  const AssetId: React.FC<{ id: string; showTooltip?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({
    id,
    showTooltip = true,
    size = 'md'
  }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }

    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }

    if (id === 'BTC') {
      return (
        <div className={`inline-flex items-center font-mono ${sizeClasses[size]}`}>
          {showTooltip ? (
            <div className="tooltip tooltip-bottom" data-tip="Click to copy">
              <button
                onClick={() => handleCopy('BTC')}
                className="btn btn-ghost btn-sm normal-case px-2 h-8 min-h-8 gap-2 hover:bg-base-300/50"
              >
                <code className="tracking-wide flex items-center gap-2">
                  <span className="text-amber-400 font-semibold">BTC</span>
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  )}
                </code>
              </button>
            </div>
          ) : (
            <code className="tracking-wide">
              <span className="text-amber-400 font-semibold">BTC</span>
            </code>
          )}
        </div>
      )
    }

    return (
      <div className={`inline-flex items-center gap-1 font-mono ${sizeClasses[size]}`}>
        {showTooltip ? (
          <div className="tooltip tooltip-bottom" data-tip="Click to copy full ID">
            <button
              onClick={() => handleCopy(id)}
              className="btn btn-ghost btn-sm normal-case px-2 h-8 min-h-8 gap-2 hover:bg-base-300/50"
            >
              <code className="tracking-wide">
                <span className="text-primary">{id.slice(0, 8)}</span>
                <span className="opacity-30">...</span>
                <span className="text-secondary">{id.slice(-8)}</span>
              </code>
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <code className="tracking-wide">
            <span className="text-primary">{id.slice(0, 8)}</span>
            <span className="opacity-30">...</span>
            <span className="text-secondary">{id.slice(-8)}</span>
          </code>
        )}
      </div>
    )
  }

  const PairCard: React.FC<{ pair: Pair; assets: Record<string, Asset> }> = ({ pair, assets }) => {
    const baseAsset = pair.base_asset_id === 'BTC' ? null : assets[pair.base_asset_id]
    const quoteAsset = pair.quote_asset_id === 'BTC' ? null : assets[pair.quote_asset_id]

    return (
      <div className={`card bg-base-100 border border-base-300 hover:border-primary/40 transition-colors duration-200 ${pair.is_active ? 'border-l-4 border-l-primary' : ''}`}>
        <div className="card-body p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{pair.base_asset[0]}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className={pair.base_asset === 'BTC' ? 'text-amber-400' : ''}>{pair.base_asset}</span>
                  <span className="text-base-content/20">/</span>
                  <span className={pair.quote_asset === 'BTC' ? 'text-amber-400' : ''}>{pair.quote_asset}</span>
                </h3>
                <p className="text-sm opacity-60">
                  {baseAsset?.name || pair.base_asset} / {quoteAsset?.name || pair.quote_asset}
                </p>
              </div>
            </div>
            <div className={`badge gap-1.5 ${pair.is_active ? 'badge-success badge-outline' : 'badge-error badge-outline'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pair.is_active ? 'bg-success' : 'bg-error'}`}></span>
              {pair.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Asset IDs */}
          <div className="bg-base-200/50 rounded-lg p-3 space-y-2 border border-base-300/50">
            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-50 uppercase tracking-wider">Base</span>
              <AssetId id={pair.base_asset_id} size="sm" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs opacity-50 uppercase tracking-wider">Quote</span>
              <AssetId id={pair.quote_asset_id} size="sm" />
            </div>
          </div>

          {/* Trading Info */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/50">
              <div className="text-xs opacity-50 mb-1">Order Size</div>
              <div className="text-sm font-semibold">{pair.min_order_size} - {pair.max_order_size}</div>
              <div className="text-xs opacity-40 mt-0.5">{pair.base_asset}</div>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3 border border-base-300/50">
              <div className="text-xs opacity-50 mb-1">Precision</div>
              <div className="text-sm font-semibold">{pair.price_precision} / {pair.quantity_precision}</div>
              <div className="text-xs opacity-40 mt-0.5">Price / Qty</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200" data-theme={theme}>
      {/* Navbar */}
      <div className="navbar bg-base-100/80 backdrop-blur-xl border-b border-base-300 sticky top-0 z-50 px-2 sm:px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-52">
              <li><a href="#assets" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 4.5l7.5 4.5m0 0l7.5-4.5M12 9v8.25m0-8.25l-7.5-4.5M12 9l7.5-4.5M4.5 4.5v8.25m15-8.25v8.25m-15 0l7.5 4.5m7.5-4.5l-7.5 4.5" />
                </svg>
                Assets
              </a></li>
              <li><a href="#pairs" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Trading Pairs
              </a></li>
            </ul>
          </div>
          <a className="btn btn-ghost normal-case px-2">
            <img src={fullLogo} alt="KaleidoSwap" className="h-6 sm:h-7 w-auto" />
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="#assets" className="font-medium gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 4.5l7.5 4.5m0 0l7.5-4.5M12 9v8.25m0-8.25l-7.5-4.5M12 9l7.5-4.5M4.5 4.5v8.25m15-8.25v8.25m-15 0l7.5 4.5m7.5-4.5l-7.5 4.5" />
                </svg>
                Assets
              </a>
            </li>
            <li>
              <a href="#pairs" className="font-medium gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Trading Pairs
              </a>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-2">
          <button onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} className="btn btn-ghost btn-circle btn-sm">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm sm:btn-md btn-outline btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="capitalize">{network}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-52">
              <li>
                <a
                  onClick={() => navigate('/signet')}
                  className={`flex items-center gap-2 ${network === 'signet' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-medium">Signet</span>
                    <span className="text-xs opacity-60">Bitcoin Signet Network</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative py-16 sm:py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={logo}
                  alt="KaleidoSwap"
                  className="w-20 h-20 sm:w-28 sm:h-28 animate-float"
                />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 scale-150"></div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-ks-teal to-primary bg-200% animate-gradient">
              KaleidoSwap Registry
            </h1>

            <p className="text-base sm:text-lg md:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed mb-8">
              Explore RGB assets and trading pairs available through the KaleidoSwap market maker on the{' '}
              <span className="font-semibold text-primary">{network}</span> network.
              Trade assets over the Lightning Network using RGB channels.
            </p>

            {/* Network Warning */}
            <div className="max-w-3xl mx-auto mb-10 rounded-xl border border-warning/30 bg-warning/5 p-4 flex gap-3 text-left">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-warning mb-1">Test Environment</h3>
                <p className="text-sm opacity-70">Assets listed here have no real monetary value and are not linked with any official issuer. They are minted by the market maker solely to simulate real scenarios for testing purposes.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-16">
              <a
                href="#assets"
                className="btn btn-primary btn-lg gap-3 w-full sm:w-auto sm:min-w-[200px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 4.5l7.5 4.5m0 0l7.5-4.5M12 9v8.25m0-8.25l-7.5-4.5M12 9l7.5-4.5M4.5 4.5v8.25m15-8.25v8.25m-15 0l7.5 4.5m7.5-4.5l-7.5 4.5" />
                </svg>
                Browse Assets
              </a>
              <a
                href="#pairs"
                className="btn btn-outline btn-lg gap-3 w-full sm:w-auto sm:min-w-[200px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                View Pairs
              </a>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-6">
                  <h3 className="card-title text-lg mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How it works
                  </h3>
                  <ul className="steps steps-vertical text-sm">
                    <li className="step step-primary">Browse available RGB assets and trading pairs</li>
                    <li className="step step-primary">Buy RGB-enabled Lightning channels from LSP</li>
                    <li className="step step-primary">Trade assets securely over Lightning</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-6">
                  <h3 className="card-title text-lg mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Market Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg border border-base-300/50">
                      <div>
                        <div className="text-xs opacity-50">RGB Assets</div>
                        <div className="text-2xl font-bold text-primary">{assetsData?.assets.length || 0}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 4.5l7.5 4.5m0 0l7.5-4.5M12 9v8.25m0-8.25l-7.5-4.5M12 9l7.5-4.5M4.5 4.5v8.25m15-8.25v8.25m-15 0l7.5 4.5m7.5-4.5l-7.5 4.5" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg border border-base-300/50">
                      <div>
                        <div className="text-xs opacity-50">Trading Pairs</div>
                        <div className="text-2xl font-bold text-secondary">{pairsData?.pairs.length || 0}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-2 sm:p-4 space-y-6 sm:space-y-8 mb-8 sm:mb-16">
        {/* Assets Section */}
        <div id="assets" className="card bg-base-100 border border-base-300">
          <div className="card-body p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-xl sm:text-2xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 4.5l7.5 4.5m0 0l7.5-4.5M12 9v8.25m0-8.25l-7.5-4.5M12 9l7.5-4.5M4.5 4.5v8.25m15-8.25v8.25m-15 0l7.5 4.5m7.5-4.5l-7.5 4.5" />
                </svg>
                Supported Assets
              </h2>
              {isLoadingAssets && (
                <span className="loading loading-spinner loading-md text-primary"></span>
              )}
            </div>
            <div className="divider my-0"></div>
            {assetsError && (
              <div className="rounded-xl border border-error/30 bg-error/5 p-4 flex gap-3 mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-error">Error loading assets</h3>
                  <p className="text-sm opacity-70">{(assetsError as ApiError).message || 'An unexpected error occurred'}</p>
                </div>
              </div>
            )}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="table table-sm sm:table-md">
                <thead className="text-xs sm:text-sm">
                  <tr className="border-b border-base-300">
                    <th className="bg-transparent">Ticker</th>
                    <th className="bg-transparent">Name</th>
                    <th className="bg-transparent min-w-[180px] sm:min-w-[300px]">Asset ID</th>
                    <th className="bg-transparent">Precision</th>
                    <th className="bg-transparent">Supply</th>
                    <th className="bg-transparent">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  {assetsData?.assets.map((asset: Asset) => (
                    <tr key={asset.asset_id} className="hover:bg-base-200/50 border-b border-base-300/50 transition-colors">
                      <td className="font-semibold text-primary">{asset.ticker}</td>
                      <td className="opacity-80">{asset.name}</td>
                      <td>
                        <AssetId id={asset.asset_id} />
                      </td>
                      <td className="font-mono">{asset.precision}</td>
                      <td className="font-mono">{new Intl.NumberFormat().format(asset.issued_supply)}</td>
                      <td>
                        <div className={`badge gap-1.5 ${asset.is_active ? 'badge-success badge-outline' : 'badge-error badge-outline'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${asset.is_active ? 'bg-success' : 'bg-error'}`}></span>
                          {asset.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trading Pairs Section */}
        <section id="pairs" className="py-4 sm:py-8">
          <div className="container mx-auto">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold">Trading Pairs</h2>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search pairs..."
                      className="input input-bordered w-full sm:w-80 pr-10 focus:border-primary focus:outline-none"
                      value={pairFilter}
                      onChange={(e) => setPairFilter(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {isLoadingPairs || isLoadingAssets ? (
                <div className="grid place-items-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : pairsError || assetsError ? (
                <div className="rounded-xl border border-error/30 bg-error/5 p-4 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Failed to load data. Please try again later.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedPairs.map((pair: Pair) => (
                    <PairCard
                      key={pair.id}
                      pair={pair}
                      assets={assetsData?.assets.reduce((acc: Record<string, Asset>, asset: Asset) => {
                        acc[asset.asset_id] = asset
                        return acc
                      }, {}) || {}}
                    />
                  ))}
                  {sortedPairs.length === 0 && (
                    <div className="col-span-full">
                      <div className="text-center py-12 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium">No pairs found</p>
                        <p className="text-sm mt-1">Try adjusting your search query</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-base-300 bg-base-100">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col items-center gap-6">
            <img src={fullLogo} alt="KaleidoSwap" className="h-6 w-auto" />

            <div className="flex items-center gap-4">
              <a href="https://github.com/kaleidoswap" className="btn btn-ghost btn-sm gap-2 opacity-60 hover:opacity-100">
                <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={siGithub.path} />
                </svg>
                <span className="hidden sm:inline text-sm">GitHub</span>
              </a>
              <a href="https://docs.kaleidoswap.com" className="btn btn-ghost btn-sm gap-2 opacity-60 hover:opacity-100">
                <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={siReadthedocs.path} />
                </svg>
                <span className="hidden sm:inline text-sm">Docs</span>
              </a>
              <a href="https://x.com/kaleidoswap" className="btn btn-ghost btn-sm btn-square opacity-60 hover:opacity-100">
                <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={siX.path} />
                </svg>
              </a>
              <a href="https://t.me/kaleidoswap" className="btn btn-ghost btn-sm btn-square opacity-60 hover:opacity-100">
                <svg role="img" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={siTelegram.path} />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-success font-medium">Privacy First</span>
              <span className="opacity-40 mx-1">|</span>
              <span className="opacity-50">No cookies, trackers, or analytics</span>
            </div>

            <p className="text-xs opacity-40">2025-2026 KaleidoSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signet" replace />} />
        <Route path="/:network" element={<Registry />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

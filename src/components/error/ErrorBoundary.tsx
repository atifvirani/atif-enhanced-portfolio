import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Matrix404Page } from './Matrix404Page'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Matrix404Page
          errorTitle="RUNTIME // MATRIX_INTERRUPT"
          errorMessage="A fatal exception occurred during component render. The matrix execution thread has been suspended."
          errorDetails={this.state.error?.message || 'Unknown runtime error'}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

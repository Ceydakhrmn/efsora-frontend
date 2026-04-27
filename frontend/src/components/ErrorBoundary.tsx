import type { ReactNode, ErrorInfo } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo: errorInfo.componentStack,
    })

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.href = '/dashboard'
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
              <div className="mb-4 flex justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>

              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Oops! Bir hata oluştu
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Uygulamada beklenmeyen bir sorun yaşandı. Lütfen sayfayı yenilemek veya anasayfaya gitmek için aşağıdaki düğmeyi tıklayın.
              </p>

              {isDevelopment && this.state.error && (
                <div className="mb-6 max-h-40 overflow-auto rounded bg-muted p-3 text-left">
                  <p className="mb-2 font-mono text-xs font-semibold text-destructive">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words">
                      {this.state.errorInfo}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sayfayı Yenile
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/'
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Anasayfaya Git
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Sorun devam ederse lütfen yöneticinize başvurun.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

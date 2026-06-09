import type { ReactNode, ErrorInfo } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sentry } from '@/lib/sentry'
import { I18nContext } from '@/i18n'

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
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ hasError: true, error, errorInfo: errorInfo.componentStack ?? null })
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack)
      Sentry.captureException(error)
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/dashboard'
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV
      return (
        <I18nContext.Consumer>
          {({ t }) => (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
              <div className="w-full max-w-md">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-foreground">
                    {t.common.errorTitle}
                  </h1>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t.common.errorMessage}
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
                    <Button onClick={this.handleReset} className="w-full" size="lg">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t.common.errorReload}
                    </Button>
                    <Button
                      onClick={() => { window.location.href = '/' }}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {t.common.errorHome}
                    </Button>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground">
                    {t.common.errorContact}
                  </p>
                </div>
              </div>
            </div>
          )}
        </I18nContext.Consumer>
      )
    }
    return this.props.children
  }
}

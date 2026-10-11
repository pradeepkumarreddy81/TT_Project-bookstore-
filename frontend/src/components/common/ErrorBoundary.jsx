import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-paper-light border border-paper-border rounded-lg p-8 shadow-book text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <span className="text-[10px] uppercase tracking-wide-label font-bold text-terracotta block mb-1">
              Rendering Interruption
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink tracking-tight-title mb-2">
              Something Interrupted The Page
            </h1>
            <p className="text-xs text-ink-muted leading-relaxed mb-6">
              An unexpected client error occurred while rendering the folio view. You may safely refresh or return to the main catalogue.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-paper-muted rounded border border-paper-border text-[11px] font-mono text-left text-ink-subtle overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="md" onClick={this.handleReload}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reload
              </Button>
              <Button variant="primary" size="md" onClick={() => (window.location.href = '/')}>
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        // Error already captured in state via getDerivedStateFromError
    }

    public render() {
        if (this.state.hasError) {
            const isMissingConfig = this.state.error?.message.includes('API') || this.state.error?.message.includes('Missing');

            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <Card className="max-w-md w-full border-destructive/20 shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                            <CardDescription>
                                {isMissingConfig
                                    ? 'Configuration Error'
                                    : 'An unexpected error occurred while loading the application.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md bg-muted p-4 text-sm font-mono text-muted-foreground break-words">
                                {this.state.error?.message || 'Unknown error'}
                            </div>

                            {isMissingConfig && (
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-semibold mb-1">To fix this:</p>
                                    <ol className="list-decimal pl-5 space-y-1">
                                        <li>Go to <strong>Settings</strong></li>
                                        <li>Configure the <strong>API URL</strong> to point to your backend</li>
                                        <li>Ensure your API server is running and accessible</li>
                                        <li>Reload the application</li>
                                    </ol>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center gap-3">
                            <Button variant="outline" onClick={() => { window.location.href = '/dashboard'; }}>
                                Return to Dashboard
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reload Page
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

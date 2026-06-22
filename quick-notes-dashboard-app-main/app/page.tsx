import { DashboardHeader } from "@/components/dashboard-header"
import { NotesGrid } from "@/components/notes-grid"
import { NotesProvider } from "@/components/notes-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <NotesProvider>
      <div className="h-screen overflow-hidden flex flex-col bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 flex-1 min-h-0 overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <NotesGrid />
          </Suspense>
        </main>
        <footer className="border-t bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground text-balance">
                Made with ❤️ by Divya for QuickNotes Dashboard
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </NotesProvider>
  )
}

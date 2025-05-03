import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

export function Pagination({ 
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if at start or end
      if (currentPage <= 2) {
        endPage = 3
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pages.push("ellipsis-1")
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-2")
      }
      
      // Always show last page if more than one page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
  }
  
  if (totalPages <= 1) return null
  
  return (
    <div className="flex items-center justify-center space-x-1 my-6">
      <Button 
        variant="outline" 
        size="icon"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => {
        if (typeof page === "string" && page.includes("ellipsis")) {
          return (
            <Button 
              key={page} 
              variant="ghost" 
              size="icon" 
              disabled 
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }
        
        return (
          <Button 
            key={index} 
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className="w-9 h-9"
          >
            {page}
          </Button>
        )
      })}
      
      <Button 
        variant="outline" 
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
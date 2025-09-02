import React, { useState } from "react"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const SearchBar = ({ onSearch, placeholder = "Search products...", className }) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery("")
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex w-full max-w-sm", className)}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pr-20"
      />
      <div className="absolute right-1 top-1 flex items-center gap-1">
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-secondary hover:text-primary"
          >
            <ApperIcon name="X" size={14} />
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-secondary hover:text-primary"
        >
          <ApperIcon name="Search" size={14} />
        </Button>
      </div>
    </form>
  )
}

export default SearchBar
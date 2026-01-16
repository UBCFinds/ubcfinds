"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge" // Shadcn Badge
import { cn } from "@/lib/utils"
import { categories } from "@/lib/map-logic"
import { mockUtilities, Utility, UtilityType } from "@/components/utility-list"

interface Props {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedCategories: UtilityType[]
  toggleCategory: (id: UtilityType) => void
  filteredUtilities: Utility[]
  selectedUtilityId?: string
  handleUtilitySelect: (u: Utility) => void
  utilities: Utility[] // We need all utilities to calculate category counts
}

export function UtilitySidebarContent({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  toggleCategory,
  filteredUtilities,
  selectedUtilityId,
  handleUtilitySelect,
  utilities, 
}: Props) {
  return (
    <div className="p-4 space-y-6">
      {/* 1. Search Bar */}
      <div className="relative" id="tour-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search utilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
      </div>

      {/* 2. Categories with Counts */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Filter by Category</h3>
        <div className="space-y-2" id="tour-categories">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategories.includes(category.id as UtilityType)
            
            // LOGIC: Count how many utilities belong to this category
            const count = utilities.filter((u) => u.type === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id as UtilityType)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", isSelected && category.color)} />
                <span className="text-sm font-medium">{category.label}</span>
                
                {/* RESTORED: Category Count Badge */}
                <Badge variant="secondary" className="ml-auto bg-muted text-muted-foreground">
                  {count}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Results with Report Badges */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Individual Utilities ({filteredUtilities.length})</h3>
        <div className="space-y-2">
          {filteredUtilities.map((utility) => (
            <button
              key={utility.id}
              onClick={() => handleUtilitySelect(utility)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                selectedUtilityId === utility.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:bg-muted",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{utility.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {utility.building} • {utility.floor}
                  </p>
                </div>
                
                {/* RESTORED: Report Badge for individual utilities */}
                {utility.status === "reported" && utility.reports > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                    {utility.reports} report{utility.reports > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
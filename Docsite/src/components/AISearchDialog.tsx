import { useState } from "react";
import {
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowRight,
  Globe,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface AISearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentModule?: string;
  currentPage?: string;
}

const aiSuggestions = [
  { id: 1, text: "Show me how to get started", icon: Sparkles },
  {
    id: 2,
    text: "Configure network discovery",
    icon: TrendingUp,
  },
  {
    id: 3,
    text: "Set up incident management",
    icon: TrendingUp,
  },
  {
    id: 4,
    text: "Cloud discovery best practices",
    icon: TrendingUp,
  },
];

const recentSearches = [
  "How to configure SNMP discovery?",
  "Setting up agentless discovery for network devices",
  "CMDB CI relationship mapping best practices",
  "Discovery scan scheduling and automation",
];

const webResults = [
  {
    title: "Virima Official Website",
    url: "virima.com",
    description: "IT Service Management & Discovery Platform",
  },
  {
    title: "Virima Community Forum",
    url: "community.virima.com",
    description:
      "Ask questions and get help from the community",
  },
  {
    title: "Virima Support Portal",
    url: "support.virima.com",
    description: "Submit tickets and track support cases",
  },
];

export function AISearchDialog({
  open,
  onOpenChange,
  currentModule,
  currentPage,
}: AISearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"this-page" | "all-docs">("all-docs");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-white overflow-hidden">
        <DialogTitle className="sr-only">
          Search Documentation
        </DialogTitle>
        <DialogDescription className="sr-only">
          Search through Virima documentation using AI-powered
          search with suggestions and recent searches
        </DialogDescription>

        {/* Enhanced Header with Search */}
        <div className="relative border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3 px-6 py-5 pr-16">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Search className="h-5 w-5 text-emerald-600" />
            </div>
            <Input
              type="text"
              placeholder="Search documentation or web..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <Tabs defaultValue="docs" className="w-full">
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-14 p-0 w-full grid grid-cols-2">
              <TabsTrigger
                value="docs"
                className="bg-transparent data-[state=active]:bg-emerald-50 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none h-full text-slate-600 data-[state=active]:text-emerald-700 transition-all hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Search Docs
              </TabsTrigger>
              <TabsTrigger
                value="web"
                className="bg-transparent data-[state=active]:bg-blue-50 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none h-full text-slate-600 data-[state=active]:text-blue-700 transition-all hover:bg-slate-50"
              >
                <Globe className="h-4 w-4 mr-2" />
                Search Web
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[500px]">
            <TabsContent value="docs" className="m-0">
              <div className="p-6 space-y-6">
                {/* Search Scope Selection */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <RadioGroup
                    value={searchScope}
                    onValueChange={(value) => setSearchScope(value as "this-page" | "all-docs")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="this-page" id="this-page" className="border-slate-400 text-emerald-600" />
                      <Label htmlFor="this-page" className="text-sm text-slate-700 cursor-pointer">
                        Search this page
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all-docs" id="all-docs" className="border-slate-400 text-emerald-600" />
                      <Label htmlFor="all-docs" className="text-sm text-slate-700 cursor-pointer">
                        Search all docs
                      </Label>
                    </div>
                  </RadioGroup>
                  {searchScope === "this-page" && currentModule && currentPage && (
                    <div className="mt-2 text-xs text-slate-500">
                      Searching in: {currentModule} › {currentPage}
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Suggested Queries
                    </span>
                  </div>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <suggestion.icon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="text-sm text-slate-700">
                            {suggestion.text}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Recent Searches
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                      >
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span className="text-sm text-slate-600">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="web" className="m-0">
              <div className="p-6 space-y-6">
                {/* Web Search Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">
                      Web Search Results
                    </span>
                  </div>
                </div>

                {/* Web Results */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Popular Resources
                    </span>
                  </div>
                  <div className="space-y-3">
                    {webResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full flex items-start gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group text-left"
                      >
                        <div className="p-2 bg-white rounded-lg mt-0.5">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm text-black-premium">
                              {result.title}
                            </h4>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                          <p className="text-xs text-blue-600 mb-1">
                            {result.url}
                          </p>
                          <p className="text-xs text-slate-600">
                            {result.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>↑ ↓ Navigate</span>
              <span>↵ Select</span>
              <span>Tab Switch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Powered by</span>
              <Sparkles className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">Virima</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
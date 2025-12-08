'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  FileText,
  Download,
  Search,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { getActiveResources, incrementDownloadCount } from '@/actions/library/resourceActions';
import type { LibraryResource } from '@/types/library';
import { RESOURCE_CATEGORIES } from '@/types/library';
import { toast } from 'sonner';

export function ResourcesBrowser() {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'ebook' | 'resource'>('all');

  const loadResources = async () => {
    setLoading(true);
    try {
      const result = await getActiveResources();
      if (result.success && result.data) {
        setResources(result.data);
      } else {
        toast.error(result.error || 'Failed to load resources');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.author.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredResources(filtered);
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, searchQuery, selectedCategory, selectedType]);

  const handleDownload = async (resource: LibraryResource) => {
    try {
      // Increment download count
      await incrementDownloadCount(resource.resourceId);

      // Open file in new tab
      window.open(resource.fileUrl, '_blank');
      toast.success('Download started');
    } finally {
      // Always complete
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    return type === 'ebook' ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'ebook' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((r) => r.type === 'ebook').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((r) => r.type === 'resource').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {RESOURCE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Tabs 
              value={selectedType} 
              onValueChange={(v) => setSelectedType(v as 'all' | 'ebook' | 'resource')} 
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ebook">E-Books</TabsTrigger>
                <TabsTrigger value="resource">Resources</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh Button */}
            <Button variant="outline" size="icon" onClick={loadResources}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Type: {selectedType === 'ebook' ? 'E-Books' : 'Resources'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}{' '}
            Found
          </CardTitle>
          <CardDescription>
            {selectedType === 'all'
              ? 'Browse all e-books and resources'
              : selectedType === 'ebook'
              ? 'Browse e-books uploaded by librarians'
              : 'Browse resources uploaded by faculty'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No resources found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.resourceId} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            resource.type === 'ebook' ? 'bg-blue-100' : 'bg-green-100'
                          }`}
                        >
                          {getTypeIcon(resource.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground">By {resource.author}</p>
                          </div>
                          <Badge className={getTypeBadgeColor(resource.type)}>
                            {resource.type === 'ebook' ? 'E-Book' : 'Resource'}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{resource.description}</p>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {resource.fileType}
                          </span>
                          <span>•</span>
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span>•</span>
                          <span>{resource.category}</span>
                          <span>•</span>
                          <span>{resource.downloadCount} downloads</span>
                        </div>

                        {/* Tags */}
                        {resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Uploaded by */}
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {resource.uploadedByName} ({resource.uploadedByRole})
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <Button
                          onClick={() => handleDownload(resource)}
                          className="w-full md:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.open(resource.fileUrl, '_blank')}
                          className="w-full md:w-auto"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  Play,
  FileText,
  Video,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Lock,
  Eye
} from 'lucide-react';
import { 
  getCourseModules,
  type CourseModule,
  type CourseLesson
} from '@/services/courseService';
import Link from 'next/link';

interface CourseContentManagerProps {
  courseId: string;
  courseTitle: string;
}

export default function CourseContentManager({ courseId, courseTitle }: CourseContentManagerProps) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Fetch modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await getCourseModules(courseId);
      setModules(response);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course modules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Course Content</h2>
          <p className="text-muted-foreground">
            View and learn from {courseTitle}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchModules}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Course Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{modules.length}</p>
              <p className="text-sm text-muted-foreground">Total Modules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">0%</p>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
              <p className="text-gray-500 mb-4">This course doesn't have any modules yet</p>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModule(module.id)}
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={module.is_free ? 'default' : 'secondary'}>
                      {module.is_free ? 'Free' : 'Paid'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {module.lessons?.length || 0} lessons
                    </span>
                  </div>
                </div>
              </CardHeader>
              {expandedModules.has(module.id) && (
                <CardContent>
                  <div className="space-y-3">
                    {module.lessons?.length === 0 ? (
                      <div className="text-center py-6">
                        <Play className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No lessons in this module</p>
                      </div>
                    ) : (
                      module.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            {lesson.content_type === 'video' ? (
                              <Video className="h-4 w-4 text-blue-600" />
                            ) : lesson.content_type === 'quiz' ? (
                              <FileText className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{lesson.title}</h4>
                            <p className="text-xs text-muted-foreground">{lesson.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.duration_minutes > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration_minutes}m</span>
                              </div>
                            )}
                            <Badge variant={lesson.is_free ? 'default' : 'secondary'} className="text-xs">
                              {lesson.is_free ? 'Free' : 'Paid'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!lesson.is_free}
                            >
                              {lesson.is_free ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Course Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Course Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline" className="w-full h-16 flex-col">
                <Eye className="h-6 w-6 mb-2" />
                View Course Details
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-16 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

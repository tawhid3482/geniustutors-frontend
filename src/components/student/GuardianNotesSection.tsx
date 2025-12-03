"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Plus,
  Search,
  Star,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useGetAllNoteUserQuery,
  useUpdateNoteMutation,
} from "@/redux/features/note/noteApi";
import { useAuth } from "@/contexts/AuthContext.next";

interface CreateNoteData {
  userId: string;
  title: string;
  content: string;
  is_important: boolean;
}

interface UpdateNoteData {
  title?: string;
  content?: string;
  is_important?: boolean;
}

interface TutorNote {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const GuardianNotesSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // RTK Query hooks
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const {
    data: notesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllNoteUserQuery({ id: user?.id || "" }, { skip: !user?.id });

  // Extract notes from response or use empty array
  const notes = notesResponse?.data || [];

  // Filter notes based on search term
  const filteredNotes = React.useMemo(() => {
    if (!searchTerm.trim()) return notes;

    return notes.filter(
      (note: TutorNote) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.tags &&
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );
  }, [notes, searchTerm]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TutorNote | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateNoteData>({
    userId: user?.id || "",
    title: "",
    content: "",
    is_important: false,
  });

  const { toast } = useToast();

  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createNote(formData).unwrap();
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      setShowCreateModal(false);
      resetForm();
      // RTK Query will automatically refetch due to cache invalidation
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateNote({
        id: selectedNote.id,
        data: formData as UpdateNoteData,
      }).unwrap();

      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      setShowEditModal(false);
      resetForm();
      // RTK Query will automatically refetch due to cache invalidation
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      await deleteNote(selectedNote.id).unwrap();
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      setShowDeleteModal(false);
      // RTK Query will automatically refetch due to cache invalidation
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleToggleImportant = async (note: TutorNote) => {
    try {
      await updateNote({
        id: note.id,
        data: { is_important: !note.is_important },
      }).unwrap();

      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      // RTK Query will automatically refetch due to cache invalidation
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (note: TutorNote) => {
    setSelectedNote(note);
    setFormData({
      userId: user?.id || "",
      title: note.title,
      content: note.content,
      is_important: note.is_important,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (note: TutorNote) => {
    setSelectedNote(note);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: user?.id || "",
      title: "",
      content: "",
      is_important: false,
    });
    setSelectedNote(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 bg-gray-50 min-h-screen p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guardian Notes</h1>
            <p className="text-gray-600">
              Create and manage your personal notes
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            className="bg-green-600 hover:bg-green-700"
          >
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading notes
            </h3>
            <p className="text-gray-500 mb-4">
              Failed to load your notes. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guardian Notes</h1>
          <p className="text-gray-600">Create and manage your personal notes</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0
                ? "No notes yet"
                : "No notes match your search"}
            </h3>
            <p className="text-gray-500 mb-4">
              {notes.length === 0
                ? "Create your first note to get started."
                : "Try adjusting your search criteria."}
            </p>
            {notes.length === 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreating}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note: TutorNote) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {note.title}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleImportant(note)}
                    className="p-1 h-8 w-8"
                    disabled={isUpdating}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        note.is_important
                          ? "text-yellow-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(note.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {note.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(note)}
                      className="p-1 h-8 w-8"
                      disabled={isUpdating}
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteModal(note)}
                      className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to keep track of your thoughts and ideas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter note title"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Content *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter note content"
                rows={6}
                disabled={isCreating}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="important"
                checked={formData.is_important}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_important: e.target.checked,
                  }))
                }
                className="rounded"
                disabled={isCreating}
              />
              <label
                htmlFor="important"
                className="text-sm font-medium text-gray-700"
              >
                Mark as important
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={
                isCreating || !formData.title.trim() || !formData.content.trim()
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update your note content and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter note title"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Content *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter note content"
                rows={6}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-important"
                checked={formData.is_important}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_important: e.target.checked,
                  }))
                }
                className="rounded"
                disabled={isUpdating}
              />
              <label
                htmlFor="edit-important"
                className="text-sm font-medium text-gray-700"
              >
                Mark as important
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNote}
              disabled={
                isUpdating || !formData.title.trim() || !formData.content.trim()
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Updating..." : "Update Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={isUpdating}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardianNotesSection;

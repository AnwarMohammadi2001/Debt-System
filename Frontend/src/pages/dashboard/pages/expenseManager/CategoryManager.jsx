import React, { useState } from "react";
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const CategoryManager = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  loading,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("لطفاً نام کتگوری را وارد کنید");
      return;
    }
    onAddCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      alert("نام کتگوری نمی‌تواند خالی باشد");
      return;
    }
    onUpdateCategory(id, { name: editName.trim() });
    setEditingCategory(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("آیا از حذف این کتگوری مطمئن هستید؟")) {
      await onDeleteCategory(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TagIcon className="h-6 w-6 text-cyan-700" />
        <h2 className="text-xl font-semibold text-gray-900">
          مدیریت کتگوری‌ها
        </h2>
      </div>

      {/* Add Category Form */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="نام کتگوری جدید"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
          className="flex-1 px-4 py-3  rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700 transition-colors"
        />
        <button
          onClick={handleAddCategory}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-700 text-white rounded-lg font-medium hover:bg-cyan-800 disabled:bg-gray-300 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          افزودن
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            {editingCategory === cat.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(cat.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ذخیره
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  لغو
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TagIcon className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  {cat.description && (
                    <span className="text-sm text-gray-500">
                      - {cat.description}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="ویرایش"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          هیچ کتگوری ثبت نشده است
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

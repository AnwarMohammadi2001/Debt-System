import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const ExpenseForm = ({ categories, onSubmit, onAddCategory, loading }) => {
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split("T")[0],
    amount: "",
    categoryId: "",
    categoryName: "",
    description: "",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const newCategoryInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setShowCategoryModal(false);
      }
    };

    if (showCategoryModal) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus on search input when modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryModal]);

  // Focus on new category input when it appears
  useEffect(() => {
    if (showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewCategoryInput]);

  // Calculate modal position
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const updateModalPosition = () => {
    if (categoryButtonRef.current) {
      const buttonRect = categoryButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        left: buttonRect.left + window.scrollX,
        width: buttonRect.width,
      });
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount) {
      alert("لطفاً مبلغ را وارد کنید");
      return;
    }

    if (!formData.categoryId && !formData.categoryName) {
      alert("لطفاً کتگوری را انتخاب یا وارد کنید");
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      expenseDate: new Date().toISOString().split("T")[0],
      amount: "",
      categoryId: "",
      categoryName: "",
      description: "",
    });

    // Reset category modal state
    setShowNewCategoryInput(false);
    setNewCategoryName("");
    setSearchQuery("");
  };

  const handleSelectCategory = (category) => {
    setFormData({
      ...formData,
      categoryId: category.id,
      categoryName: category.name,
    });
    setShowCategoryModal(false);
    setSearchQuery("");
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("لطفاً نام کتگوری را وارد کنید");
      return;
    }

    try {
      // Call parent function to add new category
      const newCategory = await onAddCategory({ name: newCategoryName.trim() });

      // Select the newly created category
      setFormData({
        ...formData,
        categoryId: newCategory.id,
        categoryName: newCategory.name,
      });

      setShowCategoryModal(false);
      setShowNewCategoryInput(false);
      setNewCategoryName("");
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("خطا در ایجاد کتگوری جدید");
    }
  };

  const handleNewCategoryKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewCategory();
    }
  };

  const handleCategoryModalOpen = () => {
    updateModalPosition();
    setShowCategoryModal(true);
    setSearchQuery("");
  };

  // Get selected category name for display
  const selectedCategoryName = formData.categoryId
    ? categories.find((cat) => cat.id === formData.categoryId)?.name
    : formData.categoryName || "";

  return (
    <>
      <div className="bg-gray-50 rounded-md shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircleIcon className="h-6 w-6 text-cyan-700" />
          <h2 className="text-xl font-semibold text-gray-900">ثبت مصرف جدید</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expenseDate: e.target.value,
                      })
                    }
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-md focus:ring-1 focus:outline-none bg-gray-200 focus:ring-cyan-700 transition-colors"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ مصرف شده
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-3 rounded-md focus:ring-1 focus:outline-none bg-gray-200 focus:ring-cyan-700 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-x-5 justify-center">
              <label className="block text-sm font-medium text-gray-700">
                کتگوری
              </label>

              {/* Category Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`px-4 py-2 text-sm rounded-md border  transition-all duration-200 active:scale-95
          ${
            formData.categoryId === category.id
              ? "bg-cyan-700 text-white border-cyan-700 shadow-md"
              : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-200"
          }`}
                  >
                    {category.name}
                  </button>
                ))}

                {/* Add New Category Button */}
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="px-4 py-2 text-sm rounded-md border border-dashed border-gray-400 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  + افزودن جدید
                </button>
              </div>
            </div>
            {/* New Category Input */}
            {showNewCategoryInput && (
              <div className=" flex gap-2 items-center justify-center mt-2 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="نام کتگوری جدید"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  ایجاد
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName("");
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  لغو
                </button>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات
              </label>
              <textarea
                placeholder="توضیحات مصرف"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows="1"
                className="w-full px-4 py-3 rounded-md focus:ring-1 focus:outline-none bg-gray-200 focus:ring-cyan-700 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !formData.amount ||
              (!formData.categoryId && !formData.categoryName)
            }
            className="mt-6 w-full bg-cyan-700 text-white py-3 px-4 rounded-md font-medium cursor-pointer hover:bg-cyan-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "در حال ثبت..." : "ثبت مصرف"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ExpenseForm;

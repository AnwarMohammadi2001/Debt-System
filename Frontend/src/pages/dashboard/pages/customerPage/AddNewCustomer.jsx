import React, { useEffect } from "react";
import AnimatedModal from "../../../../components/common/AnimatedModal";
import { FaUserPlus } from "react-icons/fa";
import { useCreateCustomer } from "../../../../hooks/useCreateCustomer";
import { createCustomer } from "../../services/CustomerService";
import Swal from "sweetalert2";

const AddNewCustomer = ({
  isAddModalOpen,
  setIsAddModalOpen,
  onCreated, // اینو اضافه کن
  formData,
  setFormData,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newCustomer = await createCustomer(formData);

      Swal.fire({
        icon: "success",
        title: "ثبت شد",
        timer: 1500,
        showConfirmButton: false,
      });

      setIsAddModalOpen(false);

      if (onCreated) {
        onCreated(newCustomer);
      }

      setFormData({
        name: "",
        lastName: "",
        phone: "",
        address: "",
        customerType: "print",
        isStock: false,
      });
    } catch (error) {
      Swal.fire("خطا", "مشکلی پیش آمد", "error");
    }
  };
  useEffect(() => {
    if (formData.customerType === "print" && formData.isStock === null) {
      setFormData((prev) => ({ ...prev, isStock: false }));
    }
  }, [formData.customerType]);

  return (
    <>
      <AnimatedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="bg-white rounded-md shadow-2xl w-full p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 flex justify-center items-center gap-3">
            <FaUserPlus className="text-cyan-800" /> ثبت مشتری جدید
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نام
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 focus:ring-1 focus:ring-cyan-800 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  شماره تماس
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 focus:ring-1 focus:ring-cyan-800 outline-none"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نوع مشتری
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 focus:ring-1 focus:ring-cyan-800 outline-none"
                value={formData.customerType}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    customerType: value,
                    isStock: value === "print" ? false : null,
                  });
                }}
              >
                <option value="print">مشتری چاپ</option>
                <option value="copy">مشتری کاپی</option>
              </select>
              {formData.customerType === "print" && (
                <div className="mt-2">
                  <div className="flex gap-4">
                    <label
                      className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer border ${
                        formData.isStock === true
                          ? "bg-cyan-800 text-white border-cyan-800"
                          : "bg-gray-200 text-gray-700 border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="isStock"
                        value="true"
                        checked={formData.isStock === true}
                        onChange={() =>
                          setFormData({ ...formData, isStock: true })
                        }
                        className="hidden"
                      />
                      گدام دارد
                    </label>
                    <label
                      className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer border ${
                        formData.isStock === false
                          ? "bg-cyan-800 text-white border-cyan-800"
                          : "bg-gray-200 text-gray-700 border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="isStock"
                        value="false"
                        checked={formData.isStock === false}
                        onChange={() =>
                          setFormData({ ...formData, isStock: false })
                        }
                        className="hidden"
                      />
                      گدام ندارد
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                آدرس
              </label>
              <textarea
                rows="2"
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200 focus:ring-1 focus:ring-cyan-800 outline-none"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 rounded-md font-bold transition"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-cyan-800 text-white rounded-md hover:bg-cyan-900 font-bold shadow-lg transition active:scale-95"
              >
                ثبت اطلاعات
              </button>
            </div>
          </form>
        </div>
      </AnimatedModal>
    </>
  );
};

export default AddNewCustomer;

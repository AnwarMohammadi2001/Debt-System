import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerWallet, addCustomerPayment } from "../pages/dashboard/services/CustomerService";
import { FaUserCircle, FaMoneyBillWave, FaArrowLeft, FaHistory, FaFileInvoiceDollar, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const CustomerWallet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // orders | payments | summary
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDesc, setPayDesc] = useState("");

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await getCustomerWallet(id);
      setData(res);
    } catch (error) {
      Swal.fire("خطا", "اطلاعات یافت نشد", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await addCustomerPayment({
        customerId: id,
        amount: parseFloat(payAmount),
        description: payDesc
      });
      Swal.fire("موفق", "پرداخت با موفقیت ثبت شد", "success");
      setIsPayModalOpen(false);
      setPayAmount("");
      setPayDesc("");
      fetchWallet(); // رفرش اطلاعات
    } catch (error) {
      Swal.fire("خطا", "ثبت پرداخت انجام نشد", "error");
    }
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری حساب...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">مشتری یافت نشد.</div>;

  const { customer, stats, orders, payments } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-cyan-800 transition">
          <FaArrowLeft /> بازگشت به لیست
        </button>
        <h1 className="text-2xl font-bold text-gray-800">کیف پول (Wallet) مشتری</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-cyan-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-50 p-4 rounded-full">
            <FaUserCircle className="text-5xl text-cyan-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{customer.name} {customer.lastName}</h2>
            <p className="text-gray-500 font-mono mt-1">{customer.phone}</p>
            <span className="inline-block mt-2 bg-gray-100 px-3 py-1 rounded text-xs font-bold text-gray-600">
               نوع: {customer.customerType === 'print' ? 'چاپ' : 'کاپی'}
            </span>
          </div>
        </div>

        {/* Balance Box */}
        <div className={`text-center p-4 rounded-xl border-2 ${stats.balance > 0 ? 'border-red-100 bg-red-50' : 'border-green-100 bg-green-50'}`}>
          <p className="text-sm text-gray-500 mb-1">وضعیت حساب (باقی‌داری)</p>
          <div className={`text-3xl font-bold dir-ltr ${stats.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.balance.toLocaleString()}
            <span className="text-sm mr-2">افغانی</span>
          </div>
          <p className="text-xs mt-2 font-bold">
            {stats.balance > 0 ? "بدهکار (قرض دار)" : "تصفیه شده / بستانکار"}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-4 flex items-center gap-2 font-bold transition ${activeTab === "orders" ? "text-cyan-800 border-b-2 border-cyan-800" : "text-gray-500 hover:text-gray-700"}`}
        >
          <FaFileInvoiceDollar /> لیست سفارشات (بدهی‌ها)
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 px-4 flex items-center gap-2 font-bold transition ${activeTab === "payments" ? "text-cyan-800 border-b-2 border-cyan-800" : "text-gray-500 hover:text-gray-700"}`}
        >
          <FaMoneyBillWave /> لیست پرداختی‌ها (رسیدها)
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 px-4 flex items-center gap-2 font-bold transition ${activeTab === "summary" ? "text-cyan-800 border-b-2 border-cyan-800" : "text-gray-500 hover:text-gray-700"}`}
        >
          <FaHistory /> خلاصه عملکرد
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md min-h-[300px] p-1">
        
        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">شماره سفارش</th>
                  <th className="p-3">مبلغ کل</th>
                  <th className="p-3">بیعانه (نقد)</th>
                  <th className="p-3">مانده این سفارش</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(o.createdAt).toLocaleDateString('fa-AF')}</td>
                    <td className="p-3 font-bold">#{o.id}</td>
                    <td className="p-3 font-bold text-gray-800">{o.total.toLocaleString()}</td>
                    <td className="p-3 text-green-600">{o.recip.toLocaleString()}</td>
                    <td className={`p-3 font-bold ${o.remained > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {o.remained.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="5" className="p-6 text-gray-400">سفارشی ثبت نشده است.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PAYMENTS */}
        {activeTab === "payments" && (
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-gray-700">تاریخچه پرداخت‌های نقدی</h3>
              <button onClick={() => setIsPayModalOpen(true)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 shadow">
                <FaPlus /> ثبت پرداخت جدید
              </button>
            </div>
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3">تاریخ پرداخت</th>
                  <th className="p-3">مبلغ (افغانی)</th>
                  <th className="p-3">توضیحات</th>
                  <th className="p-3">ثبت کننده</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(p.createdAt).toLocaleDateString('fa-AF')}</td>
                    <td className="p-3 font-bold text-green-700 text-lg">{p.amount.toLocaleString()}</td>
                    <td className="p-3 text-gray-600">{p.description || "-"}</td>
                    <td className="p-3 text-xs text-gray-400">{p.recordedBy || "Admin"}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan="4" className="p-6 text-gray-400">پرداختی جداگانه‌ای ثبت نشده است.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: SUMMARY */}
        {activeTab === "summary" && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
              <h3 className="text-gray-500 mb-2 font-bold">مجموع کل سفارشات</h3>
              <p className="text-3xl font-bold text-blue-700">{stats.totalDebt.toLocaleString()}</p>
              <p className="text-xs mt-2 text-blue-400">ارزش کل کارهای انجام شده</p>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center">
              <h3 className="text-gray-500 mb-2 font-bold">مجموع پرداختی‌ها</h3>
              <p className="text-3xl font-bold text-green-700">{stats.totalPaid.toLocaleString()}</p>
              <p className="text-xs mt-2 text-green-400">شامل بیعانه سفارشات + پرداخت‌های نقدی</p>
            </div>

            <div className={`p-6 rounded-2xl border text-center ${stats.balance > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="text-gray-500 mb-2 font-bold">باقی‌داری نهایی</h3>
              <p className={`text-3xl font-bold ${stats.balance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {stats.balance.toLocaleString()}
              </p>
              <p className="text-xs mt-2 text-gray-400">
                 {stats.balance > 0 ? "مبلغی که باید دریافت کنید" : "حساب صاف است"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ثبت دریافت وجه (رسید)</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">مبلغ دریافتی (افغانی)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-3 text-lg font-bold text-center dir-ltr" 
                  placeholder="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">توضیحات (بابت...)</label>
                <textarea 
                  className="w-full border rounded-lg p-2" 
                  rows="3"
                  placeholder="مثلاً: قسط اول، تسویه حساب..."
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">انصراف</button>
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">ثبت پرداخت</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerWallet;
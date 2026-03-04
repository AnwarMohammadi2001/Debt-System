import React from "react";
import { X, FileText } from "lucide-react";
const formatNumber = (n) => Number(n || 0).toLocaleString();
const Field = ({ label, value, highlight = false }) => (
  <div
    className={`flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0 ${
      highlight ? "bg-amber-50 px-3 rounded-md" : ""
    }`}
  >
    <span className="text-gray-600 text-sm">{label}</span>
    <span className={` ${highlight ? "text-amber-700" : "text-gray-700"}`}>
      {value || "—"}
    </span>
  </div>
);
const SectionHeader = ({ title, total }) => (
  <div className="flex justify-between items-center p-4 bg-gray-100 ">
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-cyan-600" />
      <h3 className="text-lg font-bold text-cyan-800">{title}</h3>
    </div>
    {total > 0 && (
      <div className="font-bold text-cyan-700 bg-white px-3 py-1 rounded-md border border-cyan-200">
        {formatNumber(total)} افغانی
      </div>
    )}
  </div>
);
const EmptyState = ({ message }) => (
  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
    <p className="text-gray-500">{message}</p>
  </div>
);
const DigitalOrderCard = ({ data, index }) => (
  <div className="border border-gray-100 rounded-md p-4 bg-white space-y-3 mb-4">
    <div className="font-bold text-cyan-800">سفارش چاپ {index + 1}</div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      <Field label="نام جنس" value={data.name} />
      <Field label="نوع کاغذ" value={data.paper_type} />
      <Field label="نوع جلد" value={data.cover_type} />
      <Field label="سایز" value={data.size} />
      <Field label="تیراژ" value={formatNumber(data.quantity)} />
      <Field label="تعداد صفحات" value={formatNumber(data.qut_sheet)} />
      <Field label="تعداد پلیت" value={formatNumber(data.qut_palet)} />
      <Field label="نوع رنگ" value={data.color} />
      <Field label="لمینیشن" value={data.leminition_type} />
      <Field label="صحافی" value={data.sahafat_type} />
      <Field label="مقدار کاغذ" value={data.Paper_weight} />
      <Field label="مقدار کاغذ جلد" value={data.cover_quantity} />
      <Field label="قیمت فی صفحه" value={formatNumber(data.price_units)} />
      <Field label="قیمت فی جلد" value={formatNumber(data.price_per)} />
    </div>

    <Field
      label="قیمت نهایی"
      value={`${formatNumber(data.total_price)} افغانی`}
      highlight
    />
  </div>
);

const OffsetOrderCard = ({ data, index }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 mb-4">
    <div className="font-bold text-cyan-800">سفارش کاپی {index + 1}</div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
      <Field label="نام کتاب" value={data.book_name} />

      <Field label="سایز" value={data.size} />
      <Field label="تعداد صفحات" value={formatNumber(data.total_sheet)} />
      <Field label="تعداد" value={formatNumber(data.quantity)} />
      <Field label="فی واحد" value={formatNumber(data.price_per_unit)} />
      <Field label=" قیمت پوش   " value={formatNumber(data.cover_price)} />
      <Field label="مقدار کاغذ" value={data.Paper_weight} />
      <Field label="توضیحات" value={data.descriptions} />
    </div>

    <Field
      label="قیمت نهایی"
      value={`${formatNumber(data.total_price)} افغانی`}
      highlight
    />
  </div>
);

/* ================= Main View ================= */

const OrderDetailsView = ({ record = {}, onClose }) => {
  const digital = record.digital || [];
  const offset = record.offset || [];

  const totalDigital = digital.reduce(
    (s, d) => s + Number(d.total_money || 0),
    0,
  );

  const totalOffset = offset.reduce(
    (s, o) => s + Number(o.total_price || 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print:bg-transparent">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b rounded-t-lg bg-gray-100 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              جزئیات کامل سفارش
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              کد سفارش: #{record.id || "N/A"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-0">
          {/* Digital Section */}
          {digital.length > 0 && (
            <div className=" rounded-lg overflow-hidden">
              <SectionHeader title="جزئیات سفارش چاپ " total={totalDigital} />
              <div className="p-4">
                {digital.length === 0 ? (
                  <EmptyState message="سفارش چاپ ثبت نشده است" />
                ) : (
                  digital.map((d, i) => (
                    <DigitalOrderCard key={i} data={d} index={i} />
                  ))
                )}
              </div>
            </div>
          )}

          {offset.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="جزئیات سفارش کاپی" total={totalOffset} />
              <div className="p-4">
                {offset.length === 0 ? (
                  <EmptyState message="سفارش کاپی ثبت نشده است" />
                ) : (
                  offset.map((o, i) => (
                    <OffsetOrderCard key={i} data={o} index={i} />
                  ))
                )}
              </div>
            </div>
          )}
          {/* Offset Section */}
        </div>
      </div>
    </div>
  );
};
export default OrderDetailsView;

"use client";

import { MapPin } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface FormData {
  name: string;
  phone: string;
  address: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  note?: string;
}

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  isUz: boolean;
}

const label = "block text-[11px] font-medium text-gray-400 mb-1";
const input = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-salmon-400";

export default function MapOrderStep({ register, errors, isUz }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

      {/* Name */}
      <div>
        <label className={label}>{isUz ? "Ismingiz" : "Ваше имя"} *</label>
        <input
          {...register("name")}
          placeholder={isUz ? "Misol: Aziz" : "Пример: Азиз"}
          className={input}
        />
        {errors.name && <p className="text-red-400 text-[11px] mt-0.5">{isUz ? "Kamida 2 harf" : "Минимум 2 буквы"}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className={label}>{isUz ? "Telefon" : "Телефон"} *</label>
        <input
          {...register("phone")}
          placeholder="+998 90 123 45 67"
          type="tel"
          className={input}
        />
        {errors.phone && <p className="text-red-400 text-[11px] mt-0.5">{isUz ? "To'g'ri telefon kiriting" : "Введите корректный телефон"}</p>}
      </div>

      {/* Address */}
      <div>
        <label className={label}>{isUz ? "Manzil" : "Адрес"} *</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-salmon-400">
          <MapPin className="w-3.5 h-3.5 text-salmon-400 shrink-0" />
          <input
            {...register("address")}
            placeholder={isUz ? "Ko'cha, uy raqami..." : "Улица, номер дома..."}
            className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        {errors.address && <p className="text-red-400 text-[11px] mt-0.5">{isUz ? "Manzil kiriting" : "Введите адрес"}</p>}
      </div>

      {/* Apartment details */}
      <div>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className={label}>{isUz ? "Podyezd" : "Подъезд"}</label>
            <input {...register("entrance")} placeholder="1" className={input} />
          </div>
          <div>
            <label className={label}>{isUz ? "Qavat" : "Этаж"}</label>
            <input {...register("floor")} placeholder="3" className={input} />
          </div>
          <div>
            <label className={label}>{isUz ? "Kvartira" : "Квартира"}</label>
            <input {...register("apartment")} placeholder="12" className={input} />
          </div>
          <div>
            <label className={label}>{isUz ? "Domofon" : "Домофон"}</label>
            <input {...register("intercom")} placeholder="12#" className={input} />
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className={label}>{isUz ? "Izoh" : "Примечание"}</label>
        <textarea
          {...register("note")}
          placeholder={isUz ? "Qo'shimcha xohishlar..." : "Дополнительные пожелания..."}
          rows={2}
          className={`${input} resize-none`}
        />
      </div>

    </div>
  );
}

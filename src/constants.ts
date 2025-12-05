import { BusinessInfo, Service } from './types';

export const BUSINESS_INFO: BusinessInfo = {
  name: "OsteoSalud - Sara Diaz",
  phone: "+34 646 133 447",
  address: "A domicilio",
  scheduleStart: 9, // 9:00 AM
  scheduleEnd: 20,  // 8:00 PM (Ampliamos un poco el final)
  breakStart: 14,   // 14:00 Inicio comida
  breakEnd: 16      // 16:00 Fin comida
};

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Osteopatía General",
    desc: "Diagnóstico y tratamiento de disfunciones de movilidad articular y tisular.",
    price: 60,
    duration: 50, // minutos
    color: "border-teal-300 text-teal-600"
  },
  {
    id: 2,
    title: "Masaje Descontracturante",
    desc: "Alivio de tensión muscular profunda, ideal para dolor de espalda y cuello.",
    price: 50,
    duration: 45,
    color: "border-sky-300 text-sky-600"
  },
  {
    id: 3,
    title: "Osteopatía Craneosacral",
    desc: "Terapia suave para equilibrar el sistema nervioso central.",
    price: 65,
    duration: 60,
    color: "border-violet-300 text-violet-600"
  },
  {
    id: 4,
    title: "Masaje Deportivo",
    desc: "Preparación y recuperación muscular para deportistas.",
    price: 55,
    duration: 50,
    color: "border-amber-300 text-amber-600"
  }
];
import React from 'react';
import { Link } from 'react-router-dom';
import Slick from 'react-slick';
import { ArrowRightIcon, SparklesIcon, PhoneArrowDownLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useFirebase } from '../context/FirebaseContext';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import useRealtimeCollection from '../hooks/useRealtimeCollection';
import { sampleServices } from '../data/sampleServices';
import { sampleGallery } from '../data/sampleGallery';

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  adaptiveHeight: true,
};

export default function HomePage() {
  const { db } = useFirebase();
  const { data: services } = useRealtimeCollection(
    () => query(collection(db, 'services'), orderBy('order', 'asc'), limit(5)),
    [db]
  );
  const { data: gallery } = useRealtimeCollection(
    () => query(collection(db, 'gallery'), orderBy('order', 'asc'), limit(6)),
    [db]
  );

  const featuredServices = services.length ? services : sampleServices;
  const featuredGallery = gallery.length ? gallery : sampleGallery;

  return (
    <div>
      <section className="hero-gradient relative overflow-hidden">
        <div className="container-padded flex flex-col gap-10 py-20 md:flex-row md:items-center">
          <div className="space-y-6 text-white md:w-2/3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs uppercase tracking-wide">
              <SparklesIcon className="h-4 w-4" />
              Luxury Braid Experiences
            </div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
              Gorgeous & Groomed — Braiding artistry that celebrates you.
            </h1>
            <p className="max-w-2xl text-base text-white/90 sm:text-lg">
              Discover modern protective styles, knotless braids, loc care, and editorial looks crafted with precision. Seamless booking, curated add-ons, and a luxe studio experience await.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="btn-primary">
                Book your style
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/services" className="btn-outline bg-white/20 text-white hover:bg-white/30">
                Explore services
              </Link>
            </div>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="text-2xl font-bold">300+</p>
                <p className="text-white/80">Beautiful styles this year</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.9★</p>
                <p className="text-white/80">Client experience rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24hr</p>
                <p className="text-white/80">Easy online booking</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3">
            <div className="card-glass overflow-hidden rounded-3xl p-2 shadow-xl">
              <Slick {...carouselSettings}>
                {featuredServices.map((service) => (
                  <div key={service.id} className="p-4">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
                      <div
                        className="h-56 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${service.imageUrl || 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80'})` }}
                      ></div>
                      <div className="space-y-2 p-6">
                        <h3 className="font-display text-xl text-blush-600">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                          <span>Starting at</span>
                          <span>${service.startingPrice || service.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slick>
            </div>
          </div>
        </div>
      </section>

      <section className="container-padded section-padding">
        <div className="card-glass rounded-3xl p-8 shadow-xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <PhoneArrowDownLeftIcon className="h-12 w-12 text-blush-500" />
              <h2 className="font-display text-2xl text-blush-700">Concierge booking</h2>
              <p className="text-sm text-gray-600">
                Select services, add-ons, and secure your appointment with a deposit. Our availability updates in real-time to prevent double bookings.
              </p>
            </div>
            <div className="space-y-3">
              <CameraIcon className="h-12 w-12 text-blush-500" />
              <h2 className="font-display text-2xl text-blush-700">Recent artistry</h2>
              <p className="text-sm text-gray-600">
                Explore our gallery for knotless braids, boho blends, curated loc care, and glam looks tailored to every occasion.
              </p>
            </div>
            <div className="space-y-3">
              <SparklesIcon className="h-12 w-12 text-blush-500" />
              <h2 className="font-display text-2xl text-blush-700">Premium care</h2>
              <p className="text-sm text-gray-600">
                Expert techniques, scalp nourishment, and protective styling guidance to keep you gorgeous long after your appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-padded section-padding">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-blush-700">Recent work</h2>
          <Link to="/gallery" className="text-sm font-semibold text-blush-600">
            View full gallery →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {featuredGallery.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-lg">
              {item.mediaType === 'video' ? (
                <iframe src={item.url} title={item.caption} className="h-52 w-full" allowFullScreen></iframe>
              ) : (
                <div
                  className="h-52 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'})` }}
                ></div>
              )}
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-padded grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-blush-700">Ready for your glow-up?</h2>
            <p className="text-gray-600">
              Book a consultation or appointment in minutes. Receive instant confirmation, deposit instructions, and reminders as your date approaches.
            </p>
            <Link to="/booking" className="btn-primary w-fit">
              Start booking now
            </Link>
          </div>
          <div className="card-glass rounded-3xl p-8 shadow-xl">
            <h3 className="font-display text-xl text-blush-700">Studio hours</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex justify-between border-b border-gray-200/60 pb-2">
                <span>Monday - Thursday</span>
                <span>9:00 am - 7:00 pm</span>
              </li>
              <li className="flex justify-between border-b border-gray-200/60 pb-2">
                <span>Friday</span>
                <span>9:00 am - 5:00 pm</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 am - 3:00 pm</span>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-blush-100 p-4 text-sm text-blush-700">
              Need a custom appointment? Email hello@gorgeousandgroomed.com and we'll do our best to accommodate.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

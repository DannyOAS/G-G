import React, { useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFirebase } from '../context/FirebaseContext';
import { collection, orderBy, query } from 'firebase/firestore';
import useRealtimeCollection from '../hooks/useRealtimeCollection';
import { sampleGallery } from '../data/sampleGallery';
import { sampleServices } from '../data/sampleServices';

function GalleryFilter({ services, active, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={() => onChange('all')}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          active === 'all' ? 'bg-blush-500 text-white' : 'bg-white text-blush-600 shadow'
        }`}
      >
        All looks
      </button>
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onChange(service.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === service.id ? 'bg-blush-500 text-white' : 'bg-white text-blush-600 shadow'
          }`}
        >
          {service.name}
        </button>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const { db } = useFirebase();
  const { data: galleryItems } = useRealtimeCollection(
    () => query(collection(db, 'gallery'), orderBy('order', 'asc')),
    [db]
  );
  const { data: services } = useRealtimeCollection(
    () => query(collection(db, 'services'), orderBy('order', 'asc')),
    [db]
  );

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const items = galleryItems.length ? galleryItems : sampleGallery;
  const serviceList = services.length ? services : sampleServices;

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.serviceId === activeFilter);
  }, [items, activeFilter]);

  return (
    <div className="container-padded section-padding">
      <div className="space-y-4 text-center">
        <h1 className="font-display text-4xl text-blush-700">Gallery</h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-600">
          Swipe through recent braids, loc transformations, and editorial glam moments. Filter by service to find your signature look.
        </p>
      </div>

      <div className="mt-10">
        <GalleryFilter services={serviceList} active={activeFilter} onChange={setActiveFilter} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            {item.mediaType === 'video' ? (
              <div className="relative h-60 w-full">
                <iframe src={item.url} className="h-full w-full" title={item.caption}></iframe>
              </div>
            ) : (
              <div
                className="h-60 w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.url || 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80'})` }}
              ></div>
            )}
            <div className="p-4 text-left">
              <p className="font-semibold text-gray-800">{item.caption}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-blush-500">
                {serviceList.find((service) => service.id === item.serviceId)?.name || 'Signature look'}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {selectedItem && (
              <Dialog.Panel className="card-glass relative max-w-3xl overflow-hidden rounded-3xl bg-white">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-700 shadow"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                {selectedItem.mediaType === 'video' ? (
                  <iframe src={selectedItem.url} className="h-[400px] w-full" title={selectedItem.caption} allowFullScreen></iframe>
                ) : (
                  <div
                    className="h-[400px] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedItem.url})` }}
                  ></div>
                )}
                <div className="p-6">
                  <Dialog.Title className="font-display text-2xl text-blush-700">{selectedItem.caption}</Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600">
                    {serviceList.find((service) => service.id === selectedItem.serviceId)?.description ||
                      'Customized braiding tailored to your vision.'}
                  </p>
                </div>
              </Dialog.Panel>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

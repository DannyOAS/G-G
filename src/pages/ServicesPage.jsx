import React from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { collection, orderBy, query } from 'firebase/firestore';
import useRealtimeCollection from '../hooks/useRealtimeCollection';
import { sampleServices } from '../data/sampleServices';
import { formatCurrency } from '../utils/booking';

export default function ServicesPage() {
  const { db } = useFirebase();
  const { data: services, loading } = useRealtimeCollection(
    () => query(collection(db, 'services'), orderBy('order', 'asc')),
    [db]
  );
  const serviceList = services.length ? services : sampleServices;

  return (
    <div className="container-padded section-padding">
      <div className="space-y-4 text-center">
        <h1 className="font-display text-4xl text-blush-700">Signature services</h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-600">
          Premium braiding, protective styles, and loc care designed to keep your crown flourishing. Explore add-ons for complete customization.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {serviceList.map((service) => (
          <div key={service.id} className="card-glass flex flex-col rounded-3xl bg-white shadow-xl lg:flex-row">
            <div
              className="h-56 w-full flex-shrink-0 rounded-t-3xl bg-cover bg-center lg:h-auto lg:w-64 lg:rounded-l-3xl lg:rounded-tr-none"
              style={{ backgroundImage: `url(${service.imageUrl || 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80'})` }}
            ></div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-blush-700">{service.name}</h2>
                  <div className="text-right text-sm font-semibold text-blush-600">
                    {service.pricingType === 'fixed' ? (
                      <span>{formatCurrency(service.price || service.startingPrice)}</span>
                    ) : (
                      <span>Starting at {formatCurrency(service.startingPrice || service.price)}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{service.description}</p>
                {service.addons?.length ? (
                  <div>
                    <h3 className="font-semibold text-gray-900">Add-ons</h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {service.addons.map((addon) => (
                        <li key={addon.id} className="flex justify-between">
                          <span>{addon.name}</span>
                          <span>{formatCurrency(addon.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {service.subServices?.length ? (
                  <div>
                    <h3 className="font-semibold text-gray-900">Variations</h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {service.subServices.map((sub) => (
                        <li key={sub.id} className="flex justify-between">
                          <span>{sub.name}</span>
                          <span>{formatCurrency(sub.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Duration {Math.round((service.duration || 120) / 60)} hrs · {service.requiresDeposit ? 'Deposit required' : 'Pay in full after service'}
                </div>
                <Link to={`/booking?service=${service.id}`} className="btn-primary text-sm">
                  Book now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className="mt-8 text-center text-sm text-gray-500">Loading services...</p>}
    </div>
  );
}

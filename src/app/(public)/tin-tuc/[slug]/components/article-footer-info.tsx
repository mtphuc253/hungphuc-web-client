'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';

export function ArticleFooterInfo() {
  const settings = useSelector((state) => state.settings.data);

  return (
    <div className="mt-8 rounded-lg bg-gray-100 p-6">
      <h3 className="text-xl font-bold text-primary">
        Công ty TNHH Xây dựng Hưng Phúc
      </h3>
      {settings && (
        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <strong>Địa chỉ:</strong> {settings.address}
          </p>
          <p>
            <strong>Hotline:</strong>{' '}
            <Link href={`tel:${settings.phone}`} className="text-blue-600 hover:underline">
              {settings.phone}
            </Link>
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <Link href={`mailto:${settings.email}`} className="text-blue-600 hover:underline">
              {settings.email}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

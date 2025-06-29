import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function MathGeo() {
  return (
    <>
      <Head>
        <title>Math & Geo Visualizations | RIECHE</title>
        <meta name="description" content="Explore spirograph, parametric, and sacred geometry visualizations." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 text-gray-800 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center">Math & Geo Visualizations</h1>
          <p className="text-center text-gray-600 mb-8">Explore interactive spirograph, parametric, and sacred geometry experiments.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/parametric-orchid" className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-1">Parametric Orchid</h2>
              <p className="text-gray-500 text-sm">Wireframe orchid generator with rounded petals and ruled surfaces.</p>
            </Link>
            <Link href="/orchid-spirograph" className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-1">Orchid Spirograph</h2>
              <p className="text-gray-500 text-sm">Botanical spirograph with interactive controls and color palettes.</p>
            </Link>
            <Link href="/advanced_spirograph.html" className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-1">Advanced Spirograph (Legacy)</h2>
              <p className="text-gray-500 text-sm">Classic spirograph visualizer (HTML/JS version).</p>
            </Link>
            {/* Add more links to other math/geo pages as needed */}
          </div>
        </div>
      </div>
    </>
  );
} 
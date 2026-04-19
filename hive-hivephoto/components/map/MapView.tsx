'use client'

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(async () => {
  const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
  return function Map({ points }: { points: Array<{ id: string; lat: number; lng: number; label: string }> }) {
    return (
      <MapContainer center={[20, 0]} zoom={2} style={{ height: 480, width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>{p.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    )
  }
}, { ssr: false })

export default LeafletMap

"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (<><h1>Algo salió mal</h1><button onClick={reset}>Reintentar</button></>);
}

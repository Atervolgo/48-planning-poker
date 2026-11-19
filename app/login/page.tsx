import LoginGoogle from "@/components/LoginGoogle";
import LoginDemo from "@/components/LoginDemo";
import { modoDemoActivo } from "@/lib/demo";

export default function Login() {
  return (
    <>
      <h1>Iniciar sesión</h1>
      <p>Entra para crear o unirte a una sala.</p>
      <LoginGoogle />
      {modoDemoActivo() && <LoginDemo />}
    </>
  );
}

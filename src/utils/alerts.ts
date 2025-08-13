import Swal from "sweetalert2";

type SweetAlertIcon = "success" | "error" | "warning" | "info" | "question";

interface AlertOptions {
  html?: string;
  text?: string | undefined;
}

export const submitAlert = (
  title: string,
  icon: SweetAlertIcon,
  options: AlertOptions = {
    html: "",
    text: undefined,
  }
) => {
  const Toast = Swal.mixin({
    showConfirmButton: true,
    confirmButtonColor: "#155dfc",
    showCloseButton: true,
    html: options.html,
    text: options.text,
  });

  Toast.fire({
    icon: icon,
    title: title,
    ...options,
  });
};

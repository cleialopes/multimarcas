// admin.js

document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('admin-login-form');
  
  if (!adminLoginForm) {
      console.error("Formulario de inicio de sesión no encontrado.");
      return;
  }

  adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Recoger los valores del formulario
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
          // Enviar las credenciales al servidor
          const response = await fetch('/api/loginAdmin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
          });
          
          if (response.ok) {
              // Si la autenticación es exitosa, redirigir al panel de administración
              const result = await response.json();
              window.location.href = result.redirect || '/dashboardAdmin';
          } else {
              // En caso de error, se muestra un mensaje (el servidor puede enviar un mensaje de error en JSON)
              const result = await response.json();
              alert(result.message || 'Credenciales incorrectas.');
          }
      } catch (error) {
          console.error('Error en el proceso de autenticación:', error);
          alert('Error en el proceso de autenticación.');
      }
  });
});

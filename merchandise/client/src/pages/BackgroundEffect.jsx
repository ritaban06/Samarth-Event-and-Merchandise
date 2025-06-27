import './index.css';  // Ensure this is at the top of your main file

export default function BackgroundEffect() {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center blur-md"
          style={{
            backgroundImage: "url('https://www.pinterest.com/adipippa/harry-potter-wallpaper/')",
            backgroundAttachment: "fixed",
            backgroundColor: "var(--color-background)", // Ensures a smooth blend
          }}
        ></div>
  
        {/* Gradient Overlay */}
        <div
          className="fixed top-0 left-0 w-full h-full"
          style={{
            background: "linear-gradient(to right, var(--color-primary-dark), transparent, var(--color-primary-dark))",
          }}
        ></div>
  
        
      </div>
    );
  }
  
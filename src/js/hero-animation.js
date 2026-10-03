document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loader = document.querySelector('.loader-overlay');
    
    if (reducedMotion) {
        if (loader) loader.style.display = 'none';
        return; // Skip animation, CSS fallbacks take over
    }

    // Prepare initial states for cinematic intro
    gsap.set(".hero-avatar-wrapper", { x: "-50vw", opacity: 0 }); 
    gsap.set(".letter-p", { opacity: 0 }); // Hidden initially
    gsap.set(".letters-rest .letter", { opacity: 0, x: 20 });
    gsap.set(".hero-label-name", { opacity: 0, y: 15 });
    gsap.set(".hero-label-bottom .role", { opacity: 0, x: -10 });
    gsap.set(".hero-label-bottom .year", { opacity: 0, y: 10 });
    gsap.set(".hero-timeline", { opacity: 0, y: -10 });
    
    // Reset CSS var to 0 for initial state
    document.querySelector('.hero-title').style.setProperty('--depth', '0');

    const tl = gsap.timeline();
    const depthProxy = { val: 0 }; // For tweening CSS variable

    // Define Social Loop Timeline
    const socialTl = gsap.timeline({ repeat: -1, paused: true });
    const socialWrappers = document.querySelectorAll('.social-wrapper');
    const socialLabel = document.querySelector('.social-label');
    
    // Label fades in once the loop starts
    if (socialLabel) {
        socialTl.to(socialLabel, { opacity: 1, duration: 1, ease: "power2.out" }, 0);
    }

    socialWrappers.forEach((wrapper, index) => {
        const iconTl = gsap.timeline();
        const accent = wrapper.querySelector('.social-accent');
        const ring = wrapper.querySelector('circle');
        const circle = wrapper.querySelector('.social-circle');
        const container = wrapper.querySelector('.social-container');
        
        // 1. Enable pointer events early
        iconTl.call(() => wrapper.classList.add('is-active'), [], 0);
        
        // 2. Entrance (Fast, rotational arrival)
        iconTl.fromTo(wrapper, 
            { opacity: 0, scale: 0.65, rotation: -15, x: -20, y: -10 },
            { opacity: 1, scale: 1, rotation: 0, x: 0, y: 0, duration: 0.5, ease: "back.out(1.5)" },
            0
        );

        // 3. Orange accent pop
        iconTl.fromTo(accent,
            { x: 0, y: 0 },
            { x: 4, y: 4, duration: 0.3, ease: "back.out(2)" },
            0.2 // slight delay after entrance begins
        );

        // 4. Circular highlight draws around
        iconTl.fromTo(ring,
            { strokeDashoffset: 214 },
            { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
            0.3
        );
        iconTl.to(ring, { opacity: 0, duration: 0.3 }, 1.0); // fades away

        // 5. Short curved float while active
        // Animate the inner container to avoid conflicting with wrapper entrance/exit coordinates
        iconTl.fromTo(container, 
            { x: 0, y: 0, rotation: 0 },
            { x: 8, y: -8, rotation: 3, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 
            0.5
        );

        // 6. Exit
        iconTl.to(wrapper, {
            scale: 1.1,
            x: 15,
            y: -15,
            rotation: 10,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                wrapper.classList.remove('is-active');
                gsap.set(ring, { opacity: 1, strokeDashoffset: 214 });
                gsap.set(accent, { x: 0, y: 0 });
            }
        }, 3.0); // Hold active for 2.5s (0.5 to 3.0)

        // Add to main loop with overlap
        socialTl.add(iconTl, index > 0 ? "-=0.3" : 0.5); // Add a 0.5s delay before first icon, so label appears first
        
        // Hover interactions (slow down timeline, pop accent)
        wrapper.addEventListener('mouseenter', () => {
            if (!wrapper.classList.contains('is-active')) return;
            gsap.to(socialTl, { timeScale: 0.2, duration: 0.3 });
            gsap.to(accent, { x: 6, y: 6, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            gsap.to(circle, { scale: 1.05, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        });
        wrapper.addEventListener('mouseleave', () => {
            gsap.to(socialTl, { timeScale: 1, duration: 0.3 });
            gsap.to(accent, { x: 4, y: 4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            gsap.to(circle, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        });
    });

    // 1. Loading Out
    tl.to(loader, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1, // very short load
        onComplete: () => loader.style.display = 'none'
    });

    // 2. Avatar Enters (Fast, physical, confident)
    tl.addLabel("avatarEnter")
      .to(".hero-avatar-wrapper", {
          opacity: 1,
          duration: 0.1 // quick fade in as it enters
      }, "avatarEnter")
      .to(".hero-avatar-wrapper", {
          x: "2vw", // The point of impact (slight overshoot)
          duration: 0.7,
          ease: "power2.in" // Accelerate into the collision
      }, "avatarEnter")
      
      .addLabel("collision", "+=0") // Exact moment of impact
      
      // 3. Collision Impact - Avatar recoil
      .to(".hero-avatar-wrapper", {
          x: 0, // settles back to original layout position
          rotation: -2,
          scale: 0.98,
          duration: 0.15,
          ease: "power3.out"
      }, "collision")
      // Avatar settles
      .to(".hero-avatar-wrapper", {
          rotation: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out"
      }, "collision+=0.15")

      // 3b. Collision Impact - P activates and reacts
      // P appears instantly on collision, pushed slightly right
      .set(".letter-p", { opacity: 1 }, "collision") 
      .fromTo(".letter-p", 
          { x: 15, rotation: 3, scale: 0.95 }, // starting state of P at impact
          { x: 0, rotation: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 
      "collision")
      
      // 4. ORTFOLIO reveal stagger
      .addLabel("reveal", "collision+=0.05") // triggers almost immediately after P activates
      .to(".letters-rest .letter", {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out"
      }, "reveal")

      // 5. Orange Depth forms (Typography physical buildup)
      .to(depthProxy, {
          val: 1,
          duration: 0.6,
          ease: "back.out(1.2)",
          onUpdate: () => {
              document.querySelector('.hero-title').style.setProperty('--depth', depthProxy.val);
          }
      }, "reveal+=0.1")

      // Typography settles (minor floating effect settling down)
      .fromTo(".hero-title", 
          { y: -5 }, 
          { y: 0, duration: 0.4, ease: "power2.out" }, 
      "reveal+=0.2")

      // 6. Support info enters
      .addLabel("support", "reveal+=0.4")
      .to(".hero-label-name", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
      }, "support")
      .to(".hero-label-bottom .role", {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out"
      }, "support+=0.1")
      .to(".hero-label-bottom .year", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
      }, "support+=0.2")
      .to(".hero-timeline", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
      }, "support+=0.3")
      // 7. Start Social Loop
      .add(() => {
          if (!reducedMotion) socialTl.play();
      }, "support+=0.8");
});

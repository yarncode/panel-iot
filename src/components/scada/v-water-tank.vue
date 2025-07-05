<template>
  <div ref="tankDiv" class="relative" :style="{ width: `${props.size}px`, height: `${props.size * 1.5}px` }">
    <p class="text-center">Bồn nước</p>
    <svg class="w-full h-full" :viewBox="`0 0 100 150`" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg">
      <!-- Tank outer border - black rounded rectangle -->
      <rect x="5" y="5" width="90" height="140" rx="6" fill="#222222" />

      <!-- Tank inner container - light gray rectangle -->
      <rect x="10" y="10" width="80" height="130" :fill="tankColor" stroke="#222222" stroke-width="1" rx="3" />

      <!-- Water -->
      <rect x="11" :y="139 - waterHeight" width="78" :height="waterHeight" :fill="waterColor" />

      <!-- Ripples (SVG circles) -->
      <template v-for="(ripple, index) in ripples" :key="`ripple-${index}`">
        <circle :cx="ripple.x" :cy="140 - waterHeight + ripple.y" :r="ripple.radius" fill="transparent"
          stroke="rgba(255,255,255,0.7)" stroke-width="1" :opacity="ripple.opacity" />
      </template>

      <!-- Bubbles (SVG circles) -->
      <template v-for="(bubble, index) in bubbles" :key="`bubble-${index}`">
        <circle :cx="bubble.x" :cy="140 - waterHeight + bubble.y" :r="bubble.size" :fill="bubbleColor" opacity="0.7" />
      </template>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    default: 50, // 0-100 percentage
  },
  size: {
    type: Number,
    default: 150, // Base size value (not directly used with fixed viewBox)
  },
  tankColor: {
    type: String,
    default: '#DDDDDD', // Light gray like in the reference image
  },
  waterColor: {
    type: String,
    default: '#4FC3F7', // Light blue water color
  },
  bubbleColor: {
    type: String,
    default: '#FFFFFF', // White bubbles
  },
});

// Refs for DOM elements
const tankDiv = ref<HTMLElement | null>(null);

// Animation frame IDs
let rippleAnimationId: number | null = null;
let bubbleAnimationId: number | null = null;

// Compute water height based on level (relative to the 130 height of the inner tank)
const waterHeight = computed(() => 130 * (props.level / 100));

// Water ripple and bubble positions
const ripples = ref<{ x: number; y: number; radius: number; opacity: number }[]>([]);
const bubbles = ref<{ x: number; y: number; size: number; speed: number }[]>([]);

// Initialize ripples and bubbles
const initAnimations = () => {
  // Initialize ripples
  ripples.value = Array.from({ length: 3 }, () => ({
    x: Math.random() * 60 + 20, // Within the water area
    y: Math.random() * 30 + 10,
    radius: Math.random() * 6 + 3,
    opacity: Math.random() * 0.5 + 0.3
  }));

  // Initialize bubbles
  const maxBubbleY = Math.max(waterHeight.value - 15, 10);
  bubbles.value = Array.from({ length: 6 }, () => ({
    x: Math.random() * 60 + 20, // Within the water area
    y: Math.random() * maxBubbleY,
    size: Math.random() * 3 + 2,
    speed: Math.random() * 0.5 + 0.2
  }));

  startAnimations();
};

// Animate water ripples
const animateRipples = () => {
  ripples.value = ripples.value.map(ripple => {
    ripple.radius += 0.15;
    ripple.opacity -= 0.008;

    // Reset ripple if it fades out
    if (ripple.opacity <= 0) {
      return {
        x: Math.random() * 60 + 20,
        y: Math.random() * 30 + 10,
        radius: Math.random() * 6 + 3,
        opacity: Math.random() * 0.5 + 0.3
      };
    }
    return ripple;
  });

  rippleAnimationId = requestAnimationFrame(animateRipples);
};

// Animate bubbles
const animateBubbles = () => {
  bubbles.value = bubbles.value.map(bubble => {
    bubble.y -= bubble.speed;

    // Reset bubble if it reaches the water surface
    if (bubble.y <= 0) {
      const maxY = Math.max(waterHeight.value - 10, 5);
      return {
        x: Math.random() * 60 + 20,
        y: maxY,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 0.5 + 0.2
      };
    }
    return bubble;
  });

  bubbleAnimationId = requestAnimationFrame(animateBubbles);
};

// Start animations
const startAnimations = () => {
  stopAnimations(); // Stop any existing animations first
  animateRipples();
  animateBubbles();
};

// Stop animations
const stopAnimations = () => {
  if (rippleAnimationId) cancelAnimationFrame(rippleAnimationId);
  if (bubbleAnimationId) cancelAnimationFrame(bubbleAnimationId);
};

// Watch for level changes
watch(() => props.level, () => {
  // No need to recreate animations, they'll adjust with the water level
}, { immediate: false });

// Initialize on mount
onMounted(() => {
  initAnimations();
});

// Clean up animations on unmount
onUnmounted(() => {
  stopAnimations();
});
</script>
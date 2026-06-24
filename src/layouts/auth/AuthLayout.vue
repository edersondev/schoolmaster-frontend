<script setup>
import { useI18n } from 'vue-i18n'
import { Lock } from '@element-plus/icons-vue'

const { t } = useI18n()
</script>

<template>
  <main
    class="grid min-h-screen bg-[#f4f1ea] bg-[radial-gradient(circle_at_72%_12%,rgba(15,118,110,0.12),transparent_28rem)] min-[821px]:grid-cols-[minmax(20rem,0.9fr)_minmax(24rem,1.1fr)]"
  >
    <section
      class="relative flex min-h-72 flex-col justify-end overflow-hidden bg-[linear-gradient(150deg,rgba(5,46,43,0.92),rgba(17,94,89,0.78)),repeating-linear-gradient(125deg,#0f766e_0_1px,#134e4a_1px_18px)] px-6 pt-28 pb-8 text-slate-50 min-[821px]:min-h-screen min-[821px]:p-[clamp(2rem,6vw,6rem)]"
      aria-label="SchoolMaster"
    >
      <div
        class="pointer-events-none absolute -top-48 -right-36 size-[28rem] rounded-full border border-white/20 shadow-[0_0_0_4rem_rgba(255,255,255,0.04),0_0_0_9rem_rgba(255,255,255,0.025)]"
        aria-hidden="true"
      ></div>
      <div
        class="absolute top-6 left-6 grid size-12 place-items-center rounded-[0.8rem] border border-white/30 bg-white/10 text-xl min-[821px]:top-[clamp(2rem,6vw,5rem)] min-[821px]:left-[clamp(2rem,6vw,6rem)]"
      >
        <ElIcon><Lock /></ElIcon>
      </div>
      <p class="mb-3 text-[0.78rem] font-extrabold tracking-[0.16em] text-teal-200 uppercase">
        {{ t('auth.brand.eyebrow') }}
      </p>
      <h1
        class="font-display text-[3.5rem] leading-[0.9] font-medium tracking-[-0.055em] min-[821px]:text-[clamp(3.2rem,7vw,6.5rem)]"
      >
        {{ t('auth.brand.product') }}
      </h1>
      <p class="mt-6 max-w-lg text-[clamp(1rem,2vw,1.25rem)] leading-[1.65] text-teal-100">
        {{ t('auth.brand.promise') }}
      </p>
      <div class="mt-8 flex gap-[0.45rem]" aria-hidden="true">
        <span class="h-1 w-11 rounded-full bg-teal-300"></span>
        <span class="h-1 w-5 rounded-full bg-teal-300/60"></span>
        <span class="h-1 w-2 rounded-full bg-teal-300/35"></span>
      </div>
    </section>

    <section class="grid place-items-center px-5 pt-8 pb-12 min-[821px]:p-[clamp(1.5rem,6vw,6rem)]">
      <div class="w-full max-w-[31rem]">
        <RouterView />
      </div>
    </section>
  </main>
</template>

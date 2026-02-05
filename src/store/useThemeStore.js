import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
            setTheme: (isDark) => set({ isDark }),
        }),
        {
            name: 'gz-theme-storage', // localStorage key
        }
    )
)

export default useThemeStore

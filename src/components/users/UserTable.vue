<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/ui'
import type { Membership } from '@/stores/rbacStore'
import type { User } from '@/stores/stateStore'

interface UserRow {
  user: User
  memberships: Membership[]
  tenantLabels: string[]
  activeMembership: Membership | null
  security: {
    twoFactorEnabled: boolean
    twoFactorRequired: boolean
  }
  sessions: Array<{
    id: string
    device: string
    location: string
    lastSeenAt: string
  }>
  isCurrentUser: boolean
}

const props = defineProps<{
  rows: UserRow[]
  selectedIds: string[]
  selectedUserId?: string | null
  currentUserId?: string | null
}>()

const emit = defineEmits<{
  'select': [userId: string]
  'toggle-selection': [userId: string]
  'toggle-all': [selected: boolean]
  'clear-selection': []
}>()

const allSelected = computed(() => {
  return props.rows.length > 0 && props.selectedIds.length === props.rows.length
})

const someSelected = computed(() => {
  return props.selectedIds.length > 0 && props.selectedIds.length < props.rows.length
})

function isSelected(userId: string): boolean {
  return props.selectedIds.includes(userId)
}

function handleToggleAll(event: Event) {
  const target = event.target as HTMLInputElement
  emit('toggle-all', target.checked)
}

function handleToggleRow(userId: string) {
  emit('toggle-selection', userId)
}

function handleSelectRow(userId: string) {
  emit('select', userId)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-800/50 bg-[#131926]">
    <table class="w-full">
      <thead>
        <tr class="border-b border-slate-800/50 bg-[#0B0F1A]/50">
          <th class="w-12 px-4 py-3 text-left">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              class="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
              @change="handleToggleAll"
            />
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Usuario
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estado
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rol activo
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Empresas
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            2FA
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sesiones
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Último acceso
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/30">
        <tr
          v-for="row in rows"
          :key="row.user.id"
          :class="[
            'transition-colors hover:bg-slate-800/20 cursor-pointer',
            selectedUserId === row.user.id ? 'bg-slate-800/30' : ''
          ]"
          @click="handleSelectRow(row.user.id)"
        >
          <td class="px-4 py-3" @click.stop>
            <input
              :checked="isSelected(row.user.id)"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
              @change="handleToggleRow(row.user.id)"
            />
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-200">{{ row.user.name }}</span>
                <span
                  v-if="row.isCurrentUser"
                  class="text-xs text-emerald-400"
                >
                  (Yo)
                </span>
              </div>
              <span class="text-xs text-slate-500">{{ row.user.email }}</span>
              <span class="text-xs text-slate-600">{{ row.user.title }}</span>
            </div>
          </td>
          <td class="px-4 py-3">
            <Badge
              :variant="row.user.status === 'active' ? 'default' : 'destructive'"
              class="text-xs"
            >
              {{ row.user.status === 'active' ? 'Activo' : 'Inactivo' }}
            </Badge>
          </td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center rounded-md bg-slate-800/50 px-2 py-1 text-xs font-medium text-slate-400">
              {{ row.activeMembership?.role || 'Sin acceso' }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="label in row.tenantLabels.slice(0, 2)"
                :key="label"
                class="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400"
              >
                {{ label }}
              </span>
              <span
                v-if="row.tenantLabels.length > 2"
                class="inline-flex items-center rounded-md bg-slate-800/50 px-2 py-1 text-xs font-medium text-slate-500"
              >
                +{{ row.tenantLabels.length - 2 }}
              </span>
            </div>
          </td>
          <td class="px-4 py-3">
            <Badge
              v-if="row.security.twoFactorEnabled"
              variant="default"
              class="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              Activo
            </Badge>
            <Badge
              v-else-if="row.security.twoFactorRequired"
              variant="secondary"
              class="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            >
              Pendiente
            </Badge>
            <Badge
              v-else
              variant="outline"
              class="border-slate-700 text-slate-500"
            >
              Opcional
            </Badge>
          </td>
          <td class="px-4 py-3">
            <span class="text-sm text-slate-400">{{ row.sessions.length }}</span>
          </td>
          <td class="px-4 py-3">
            <span class="text-sm text-slate-500">
              {{ row.user.lastLoginAt ? formatDate(row.user.lastLoginAt) : 'Sin ingreso' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length === 0" class="p-8 text-center">
      <p class="text-sm text-slate-500">No hay usuarios que coincidan con los filtros.</p>
    </div>
  </div>
</template>

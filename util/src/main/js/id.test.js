import { test, expect } from '@jest/globals'
import { short, generate, verify } from './id'

// should pass with n = 1000000, but that takes several minutes to run
// 10000 is suitable as a smoke test, but increase and run manually
// when upgrading node.js or working with id generation algorithm
const n = 10000

test('generates ' + n + ' short ids', () => {
  const ids = new Set()
  for (let i = 0; i < n; i++) {
    const id = short()
    expect(id.length).toBe(8)
    expect(ids.has(id)).toBe(false)
    ids.add(id)
    if (i % 25000 === 0) {
      console.log(i, id)
    }
  }
  expect(ids.size).toBe(n)
})

test('generates ' + n + ' unique ids', () => {
  const ids = new Set()
  for (let i = 0; i < n; i++) {
    const id = generate()
    verify(id, 1000)
    expect(id.length).toBe(32)
    expect(ids.has(id)).toBe(false)
    ids.add(id)
    if (i % 25000 === 0) {
      console.log(i, id)
    }
  }
  expect(ids.size).toBe(n)
})

test('verifies server-generated ids', () => {
  const serverIds = ['gbTreNRn3OuKzDMLWUDgd-GO_K7jvnvd', 'RLswelr53MB6z0B_WYyLdC8v_N30WAOy', 'JirEewtq3Kdxz8mqWaeOd5ln_F7_-lnE', 'S-jBewa_3HLBzCi3WgWqd2HV_KQzOzC1', 'h07melPA3KJWz_LUWVNYd8l8_Etj88t0', 'W7MLenxP3QIDz8SwWaAwd30S_HSBBn2O', 'KCnrevGt3RcVzB8pWjhBd8Nc_GWf8EDs', 'k-Z4eyPU3QEEz4XzWeHWdCHO_NclCFoy', 'C0UOeuPR3GqOz3uaWZSjd2FW_Q15y5pd', '5XIJewv43TcJz2O6WZxKd6hj_Iikcvk2', 'hx9ueuBm3K2Fz05pWUnrdCj7_JbqBDo4', 'hQneemGY3J9Yz0xaWX2IdDav_O9Le9L3', 'xOWUemi73Ipxz9b9Wi9Sd6t6_SzzXKM4', 'zPJZetGh3Q8qz1pDWe-tdA6t_RzyPi9u', 'WkMmf9793ME-z28GWg-Hd6LU_G7bIwBU', 'RTIif0Pc3M9Kz2BNWbzyd5j0_TG0_gyW', 'U15kf9o73EU5z2THWZyed6sl_QXCQwHD', '6TlKf7dJ3OiWz6anWbrfd7W0_HN-hCXO', 'vbRYfAqw3E8WzApUWg1-dBzv_MIRH0ff', 'wG-Xf7bp3QJ5z5UHWhXUd6Aq_KSzL_h5', 'A_E-f3Af3NbZz-amWbv8d92c_Pb1t_T3', '7aNXf0Hv3MA0zBo1WbVUd6DT_K9qfJK3', 'qGP3f6e73Lclz5AqWc7ed6zj_NaXxZTI', 'YO8sf0rs3F1Jz9JqWjR7d_Sd_N4CIWEk', 'Bz3UfDFI3KBSz8nsWfiMd3tc_QHo92Cs', 'i9xDf3Ud3PCAz9dIWd4bdCxR_Purt-n4', 'MYErf-Kn3Lidz1P4WUTyd1aV_O9XDgmm', 'Rr_wf3o-3J8_z4NpWjW-d1Gn_EIap-gJ', 'bm4Df5HT3TXqz1x4WgFSdDbU_NmDwdg8', '35cPf-tJ3NhIz6TZWfEsd8RG_GLO6HAj', 'ufTxf6po3FRwz9i0Wew9d4k5_O6xY3xn', '49ouf2GM3SMrz1UBWWLmd969_LlRJryl', 'oP0uf5SO3KUdz_1OWhlld6cQ_LB5bp0J', 'JPRQf4UW3MQXzCH1WhOKd9xi_He42cn1', 'GLDVf5Cy3JN0z5dpWZEDd--q_RKr-Zv6', '3RfefDV13Hnpz7cIWeIsd4Qd_G77t7MV', 'uix2fBF13KfXzBB4WZqVd8Nu_Rd379mg', 'j6KPf-EF3JDFz1u0WYhLdBez_LdI0yFZ', 'D8Ikf0223FNOz3OJWZ3fd2xg_NptUppH', '_ZyJf6Iy3Rbaz5s_Wch1d18d_EbFYdH2', 'k-Okf6g_3Siaz_CJWUIDd_cv_PI4rOGB', 'g22zf66x3Qrnz0EaWUGWd4fp_MeOVSm1', 'BMX0f7UR3FsAz2obWj0Vd5jx_NtkDImr', 'RmMpf_UT3PNgz0lhWhj5d5Es_GEV6Gmk', 'Ev9if55A3EKhzDe8WcjYd137_HfMXscX', '_ZCRf1w83TiXz6huWd2Fd6Wf_Id7aEQN', 'ba8df7ny3Op6zC96WXKNdCQl_RtzR6PG', 'kM4Gf6aC3Km8z2Q-Wer5d5Y8_Lx-UKpa', 'BhmDfDHM3HkVzDT2WZjEd6kJ_PETKcxi', 'HRWOf6te3KzxzBRyWi7Jd_A3_LQNqXo2', 'Vvmef8393GAszDOKWVESd-Rb_R7wE_Sq', 'owmDf7v83QOJz-j3WjHfd8VD_M7Moog0', 'lf4cf4re3LL0z6riWYNFd3XD_JgsfTdM', 'lj67fOoG3Jyrz5v_WXKmd7Nu_LTljGPF', 'YIWGfJaD3Tv7z4BcWgx4d2Ai_LDvrgLe', '2SUgfQr33FMmz95TWdOLd8M1_IU9G15L', 'q_fDfNCZ3QqEz48DWUSqd1-s_Js5eNF9', '4-69fKG_3RF9z9IeWdXcd0C5_NGmGpC3', 'J64RfFMz3NFUz6LQWaUkd3Ub_Hb1NcFk', 'XeEBfQlS3Rhoz0cyWad8dD10_FMsCQsL', 'q0kJfHrK3TD_z2ADWVK4d2Za_G-vGSiz', '3UOufR8T3JV8z4QZWZgRdBj7_RarO2wH', 'yr3vfN5L3Iwaz2xnWWHRd_Fy_RLjKAcL', 'muKcfSZn3TWAz3PvWaMDd3Uy_GNZSUq4', 'wkkEfHZf3T15z0NrWW1hd64j_Pha8k3u', 'VSGnfQ4C3Exgz7q6WfEYdBu5_K1oDTbv', 'mjg_fO6U3HEgz89fWis_d_m5_TmjW1Hz', 'AynMfET23R0hz6KqWd6cd91u_OAcHRLc', 'JS_3fIkw3RNuz0_rWimgd8dC_JhMsyRJ', 'oDRxfNi_3ELTz4b6WZtudCBi_K2E5oCm', 'w18gfNqe3Sijz9OMWdvod4ng_OTfKhKR', 'WEHtfPhh3Iq8zBOgWbAvd30u_QV817hB', 'lGJcfHMe3QK3z5nrWdsAd-w6_IptwiEC', 'v5P-fNPn3HUHz0PdWZEud0Q5_TXJcs5O', 'Ch3gfL3Q3MTBz2M0WYDmdCEM_SgoMIjO', 't_PtfJHn3FZKz2sNWbZfd5An_QNWIx3Q', 'yBFGfGTp3Km-z_TBWgiQdCkC_GTYjU7L', 'ckfEfHzg3GLiz1KYWXUSd754_T_6X9_E', '4ZIDfIBM3QXuz4iUWazpdDku_SK5cU1T', 'feHDfEWL3JXiz3hjWicMdAR0_I7aGZiS', 'vL5DfONw3T-dzCIIWZl8d8qG_JibWr3o', 'TSOffQkW3JOrz6s8WUJ7d6VQ_GVqGJpa', 'TownfILS3GMAzAerWYWmd5Aq_S5z924H', '4ghCfSAG3ThLz62nWjr7d6CQ_OxP5ggT', 'HCXrfTQ93QUxz03xWYJmd0PR_NPiqDd0', 'R6XkfH3Y3HeBz5lmWi-sd8_R_JB-ryTM', 'fBpwfOLl3ELnz8HNWZqOd6mx_OK3BZVv', 'Ac3vfOWl3RKQz7s4Wi-Od-ER_SgC1z6v', 'l3z_fSnQ3FArz9qAWYSIdDm5_THj-Iqu', 'iTbofJkI3SXZz4XUWULzd9YF_K0jlnFp', 'eClafMRg3GYUz6DVWjE4d8fR_JotBRm5', 'Nb3FfIAi3Sl4z7cMWdbLd2QR_HoHU9Hg', 'NpV5fSCx3G1Oz_dCWZdadBc8_HIP5Ex2', '6dzqfVl43TDfz33-Wi--d8XB_FDbszoO', 'FQi4fZDa3HNmzC0jWfmBdDiP_NsLP2EO', 'AbjcfhQi3Ql5z515Wc-pd_-0_HNd6CY4', '8EPpfYJ83RBOz5KMWXu6d5wb_JGC-g_A', 'edVtfbP73MH4z5mAWUhid0Tx_TGNP8XB', '9KmkffC23Fi6z2fxWa9Cd07Y_Ee1-4_J', 'E0eAfX_-3S8Lz7_xWiIhd35S_O5r2OLj']
  serverIds.forEach(id => verify(id, 3155760000000n))
})

test('verification failures', async () => {
  expect(() => verify('foobar')).toThrow() // length not multiple of 4
  expect(() => verify('_foobar_')).toThrow() // length not 32
  expect(() => verify('"foobar"')).toThrow() // invalid characters
  expect(() => verify('foo_foobarFOObarfooBARFOOBAR-bar')).toThrow() // invalid timestamp

  const id = generate()
  if (id.charAt(0) === '_') {
    expect(() => verify('-' + id.substring(1))).toThrow()
  } else {
    expect(() => verify('_' + id.substring(1))).toThrow()
  }

  await expect(new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        verify(id, 1000)
        reject(new Error())
      } catch (e) {
        resolve(true)
      }
    }, 2000)
  })).resolves.toBe(true)
})

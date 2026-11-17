!macro customHeader
  BrandingText "TeaPro ERP — Harsh Apex Digital Solutions"
!macroend

!macro customInit
  SetShellVarContext current
!macroend

!macro customInstall
  ; Business data is stored under the per-user application data directory.
  ; The installer must never remove or overwrite that directory during upgrades.
!macroend

!macro customUnInstall
  ; Customer data is intentionally retained. In-app, administrator-authorized
  ; data removal is the only supported destructive workflow.
!macroend

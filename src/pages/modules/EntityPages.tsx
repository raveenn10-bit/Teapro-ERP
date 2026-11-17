import { formatLkr } from '../../domain/calculations'
import { ModuleWorkspace, type ModuleField } from './ModuleWorkspace'

const statusColumn = { key: 'status', label: 'Status', format: (value: unknown) => String(value || 'active') }
const money = (value: unknown) => formatLkr(String(value ?? 0))

const estateFields: ModuleField[] = [
  { key: 'code', label: 'Estate code', required: true, placeholder: 'EST-001' },
  { key: 'name', label: 'Estate name', required: true },
  { key: 'division', label: 'Division / section', required: true },
  { key: 'acreage', label: 'Acreage', type: 'number', required: true },
  { key: 'supervisor', label: 'Supervisor' },
  { key: 'telephone', label: 'Telephone', type: 'tel' },
]

export function EstateManagementPage() {
  return <ModuleWorkspace eyebrow="Operations" title="Tea estate management" description="Manage estates, divisions, supervisors and productive acreage from one controlled register." entityName="Estate" emptyTitle="No estates registered" emptyDescription="Add your first estate to begin daily harvesting and profitability tracking." fields={estateFields} columns={[
    { key: 'code', label: 'Code' }, { key: 'name', label: 'Estate' }, { key: 'division', label: 'Division' },
    { key: 'acreage', label: 'Acres', format: (value) => Number(value || 0).toLocaleString('en-LK') }, { key: 'supervisor', label: 'Supervisor' }, statusColumn,
  ]} />
}

export function SupplierManagementPage() {
  return <ModuleWorkspace eyebrow="Procurement" title="Supplier management" description="Maintain identity, contact, banking and supplier-specific rate information securely." entityName="Supplier" emptyTitle="No suppliers registered" emptyDescription="Register suppliers before recording green leaf collections or settlements." fields={[
    { key: 'supplierCode', label: 'Supplier ID', required: true, placeholder: 'SUP-0001' },
    { key: 'name', label: 'Full name', required: true }, { key: 'nic', label: 'NIC / identification', required: true },
    { key: 'telephone', label: 'Telephone', type: 'tel', required: true }, { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'select', required: true, options: [{ label: 'Individual grower', value: 'individual' }, { label: 'Estate', value: 'estate' }, { label: 'Collection agent', value: 'agent' }] },
    { key: 'ratePerKg', label: 'Custom rate per kg (LKR)', type: 'number' }, { key: 'bankAccount', label: 'Bank account' },
  ]} columns={[
    { key: 'supplierCode', label: 'Supplier ID' }, { key: 'name', label: 'Supplier' }, { key: 'nic', label: 'NIC' },
    { key: 'telephone', label: 'Telephone' }, { key: 'category', label: 'Category' }, { key: 'ratePerKg', label: 'Rate', format: money }, statusColumn,
  ]} />
}

export function EmployeeManagementPage() {
  return <ModuleWorkspace eyebrow="People" title="Employees & payroll setup" description="Register employees and configure the wage basis used by attendance, harvesting and payroll." entityName="Employee" emptyTitle="No employees registered" emptyDescription="Add employees to start attendance, wage and performance records." fields={[
    { key: 'employeeCode', label: 'Employee ID', required: true, placeholder: 'EMP-0001' }, { key: 'name', label: 'Full name', required: true },
    { key: 'nic', label: 'NIC', required: true }, { key: 'telephone', label: 'Telephone', type: 'tel' }, { key: 'role', label: 'Job role', required: true },
    { key: 'wageType', label: 'Wage basis', type: 'select', required: true, options: [{ label: 'Daily wage', value: 'daily' }, { label: 'Weight based', value: 'weight' }, { label: 'Monthly salary', value: 'monthly' }] },
    { key: 'baseRate', label: 'Base rate (LKR)', type: 'number', required: true },
  ]} columns={[
    { key: 'employeeCode', label: 'Employee ID' }, { key: 'name', label: 'Employee' }, { key: 'role', label: 'Role' },
    { key: 'wageType', label: 'Wage basis' }, { key: 'baseRate', label: 'Base rate', format: money }, { key: 'telephone', label: 'Telephone' }, statusColumn,
  ]} />
}

export function FactoryManagementPage() {
  return <ModuleWorkspace eyebrow="Sales & dispatch" title="Tea factory management" description="Manage factory contacts, commercial terms and dispatch destinations." entityName="Factory" emptyTitle="No factories registered" emptyDescription="Register a factory before creating dispatches, invoices and settlement records." fields={[
    { key: 'factoryCode', label: 'Factory code', required: true, placeholder: 'FAC-001' }, { key: 'name', label: 'Factory name', required: true },
    { key: 'contactPerson', label: 'Contact person' }, { key: 'telephone', label: 'Telephone', type: 'tel', required: true },
    { key: 'address', label: 'Address', type: 'textarea' }, { key: 'defaultRate', label: 'Default rate per kg (LKR)', type: 'number', required: true },
  ]} columns={[
    { key: 'factoryCode', label: 'Code' }, { key: 'name', label: 'Factory' }, { key: 'contactPerson', label: 'Contact' },
    { key: 'telephone', label: 'Telephone' }, { key: 'defaultRate', label: 'Default rate', format: money }, statusColumn,
  ]} />
}

export function RoutesTransportPage() {
  return <ModuleWorkspace eyebrow="Logistics" title="Routes & transport" description="Coordinate collection routes, centers, drivers and vehicles for daily reconciliation." entityName="Route" emptyTitle="No collection routes" emptyDescription="Create a route to connect collection centers, vehicles and factory dispatches." fields={[
    { key: 'routeCode', label: 'Route code', required: true, placeholder: 'RTE-001' }, { key: 'name', label: 'Route name', required: true },
    { key: 'collectionCenter', label: 'Collection center', required: true }, { key: 'driver', label: 'Driver' },
    { key: 'vehicleNumber', label: 'Vehicle number' }, { key: 'distanceKm', label: 'Distance (km)', type: 'number' },
  ]} columns={[
    { key: 'routeCode', label: 'Code' }, { key: 'name', label: 'Route' }, { key: 'collectionCenter', label: 'Center' },
    { key: 'driver', label: 'Driver' }, { key: 'vehicleNumber', label: 'Vehicle' }, { key: 'distanceKm', label: 'Distance', format: (value) => `${Number(value || 0).toFixed(1)} km` }, statusColumn,
  ]} />
}

export function RateManagementPage() {
  return <ModuleWorkspace eyebrow="Commercial controls" title="Tea rate management" description="Publish effective-dated rates while preserving historical transaction snapshots and auditability." entityName="Rate" emptyTitle="No rates configured" emptyDescription="Create the first effective rate before entering green leaf purchases or factory dispatches." fields={[
    { key: 'rateType', label: 'Rate type', type: 'select', required: true, options: [{ label: 'Daily default', value: 'daily' }, { label: 'Monthly default', value: 'monthly' }, { label: 'Supplier-specific', value: 'supplier' }, { label: 'Factory-specific', value: 'factory' }] },
    { key: 'partyReference', label: 'Supplier / factory reference' }, { key: 'amount', label: 'Rate per kg (LKR)', type: 'number', required: true },
    { key: 'effectiveFrom', label: 'Effective from', type: 'date', required: true }, { key: 'effectiveTo', label: 'Effective to', type: 'date' },
    { key: 'provisional', label: 'Rate status', type: 'select', required: true, options: [{ label: 'Final rate', value: 'false' }, { label: 'Provisional rate', value: 'true' }] },
    { key: 'notes', label: 'Change reason / notes', type: 'textarea', required: true },
  ]} columns={[
    { key: 'rateType', label: 'Type' }, { key: 'partyReference', label: 'Party' }, { key: 'amount', label: 'Rate', format: money },
    { key: 'effectiveFrom', label: 'Effective from' }, { key: 'effectiveTo', label: 'Effective to' }, { key: 'provisional', label: 'Provisional', format: (value) => String(value) === 'true' ? 'Yes' : 'No' }, statusColumn,
  ]} />
}

export function AccountingPage() {
  return <ModuleWorkspace eyebrow="Finance" title="Chart of accounts" description="Maintain the controlled account structure used by transaction-linked journals and financial reports." entityName="Account" emptyTitle="No accounts configured" emptyDescription="Create accounts for assets, liabilities, equity, income and expenses." fields={[
    { key: 'code', label: 'Account code', required: true, placeholder: '1000' }, { key: 'name', label: 'Account name', required: true },
    { key: 'type', label: 'Account type', type: 'select', required: true, options: [{ label: 'Asset', value: 'asset' }, { label: 'Liability', value: 'liability' }, { label: 'Equity', value: 'equity' }, { label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }] },
    { key: 'openingBalance', label: 'Opening balance (LKR)', type: 'number', required: true },
  ]} columns={[
    { key: 'code', label: 'Code' }, { key: 'name', label: 'Account' }, { key: 'type', label: 'Type' },
    { key: 'openingBalance', label: 'Opening balance', format: money }, statusColumn,
  ]} />
}


// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { DocumentMetadata } from '@/lib/actions/documents';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DocumentListClient } from '@/components/dashboard/document-list-client';
vi.mock('@/lib/firebase/config', () => ({ storage: {}, auth: {} }));
vi.mock('firebase/storage', () => ({ ref: vi.fn(), uploadBytesResumable: vi.fn(), getDownloadURL: vi.fn() }));
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }));
vi.mock('@/lib/actions/documents', () => ({ registerDocument: vi.fn() }));
vi.mock('react-dropzone', () => ({ useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => ({
 getRootProps: () => ({}), getInputProps: () => ({ 'aria-label': 'Files', onChange: () => onDrop([new File(['text'], 'report.txt', {type:'text/plain'})]) }), isDragActive: false
}) }));
import { UploadZone } from '@/components/dashboard/upload-zone';
const base: DocumentMetadata & {id:string} = { id:'doc', name:'Report.pdf', type:'application/pdf', size:42, url:'https://example.invalid/report', storagePath:'test', status:'completed', createdAt:'2026-10-14T00:00:00Z', summary:'Legacy summary', tags:['legacy-tag'] };
afterEach(cleanup);
it('counts only verified complete nonblank analyses', () => {
 render(<StatsCards subscription={{plan:'Free',status:'active',documentsUsed:0,documentLimit:5,storageUsed:0,storageLimit:1000}} documents={[base, {...base,id:'valid',analysisVersion:1}, {...base,id:'blank',analysisVersion:1,summary:' '}, {...base,id:'pending',analysisVersion:1,status:'unprocessed'}]} />);
 const card = screen.getByText('AI Transforms').closest('[data-slot="card"]');
 expect(card?.textContent).toContain('1Summaries generated');
});
it('hides legacy tags and excludes them from search without hiding metadata search', () => {
 render(<DocumentListClient initialDocuments={[base]} />);
 expect(screen.queryByText('#legacy-tag')).toBeNull();
 const search=screen.getByPlaceholderText('Search documents...');
 fireEvent.change(search,{target:{value:'legacy-tag'}});
 expect(screen.queryByText('Report.pdf')).toBeNull();
 fireEvent.change(search,{target:{value:'report'}});
 expect(screen.getByText('Report.pdf')).toBeTruthy();
});
it('retains verified tag display and search', () => {
 render(<DocumentListClient initialDocuments={[{...base,analysisVersion:1}]} />);
 expect(screen.getByText('#legacy-tag')).toBeTruthy();
 fireEvent.change(screen.getByPlaceholderText('Search documents...'),{target:{value:'legacy-tag'}});
 expect(screen.getByText('Report.pdf')).toBeTruthy();
});
it('labels registration as upload rather than starting analysis', () => {
 render(<UploadZone />);
 fireEvent.change(screen.getByLabelText('Files'), {target:{value:'selected'}});
 expect(screen.getByRole('button',{name:'Upload files'})).toBeTruthy();
 expect(screen.queryByText('Start analysis')).toBeNull();
});

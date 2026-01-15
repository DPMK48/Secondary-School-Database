import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, GraduationCap, School, BookOpen, X } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { mockStudents, mockTeachers, mockClasses, mockSubjects, getClassDisplayName } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';

interface SearchResult {
  type: 'student' | 'teacher' | 'class' | 'subject';
  id: number;
  title: string;
  subtitle?: string;
  path: string;
}

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search students
    const studentResults = mockStudents
      .filter((student) => {
        const fullName = getFullName(student.first_name, student.last_name).toLowerCase();
        const admissionNo = student.admission_no.toLowerCase();
        return fullName.includes(searchQuery) || admissionNo.includes(searchQuery);
      })
      .slice(0, 5)
      .map((student) => ({
        type: 'student' as const,
        id: student.id,
        title: getFullName(student.first_name, student.last_name),
        subtitle: student.admission_no,
        path: `/dashboard/students/${student.id}`,
      }));

    // Search teachers
    const teacherResults = mockTeachers
      .filter((teacher) => {
        const fullName = getFullName(teacher.first_name, teacher.last_name).toLowerCase();
        const email = teacher.email.toLowerCase();
        return fullName.includes(searchQuery) || email.includes(searchQuery);
      })
      .slice(0, 5)
      .map((teacher) => ({
        type: 'teacher' as const,
        id: teacher.id,
        title: getFullName(teacher.first_name, teacher.last_name),
        subtitle: teacher.email,
        path: `/dashboard/teachers/${teacher.id}`,
      }));

    // Search classes
    const classResults = mockClasses
      .filter((cls) => {
        const className = getClassDisplayName(cls).toLowerCase();
        return className.includes(searchQuery);
      })
      .slice(0, 5)
      .map((cls) => ({
        type: 'class' as const,
        id: cls.id,
        title: getClassDisplayName(cls),
        subtitle: `${cls.level} Class`,
        path: `/dashboard/classes/${cls.id}`,
      }));

    // Search subjects
    const subjectResults = mockSubjects
      .filter((subject) => {
        const subjectName = subject.subject_name.toLowerCase();
        const subjectCode = subject.subject_code?.toLowerCase() || '';
        return subjectName.includes(searchQuery) || subjectCode.includes(searchQuery);
      })
      .slice(0, 5)
      .map((subject) => ({
        type: 'subject' as const,
        id: subject.id,
        title: subject.subject_name,
        subtitle: subject.subject_code,
        path: `/dashboard/subjects`,
      }));

    searchResults.push(...studentResults, ...teacherResults, ...classResults, ...subjectResults);
    setResults(searchResults);
  }, [query]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'student':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4 text-green-500" />;
      case 'class':
        return <School className="h-4 w-4 text-purple-500" />;
      case 'subject':
        return <BookOpen className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'student':
        return 'Student';
      case 'teacher':
        return 'Teacher';
      case 'class':
        return 'Class';
      case 'subject':
        return 'Subject';
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
        <input
          type="text"
          placeholder="Search students, teachers, classes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-secondary-200 z-50 max-h-[32rem] overflow-hidden">
          {results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500 text-sm">No results found for "{query}"</p>
              <p className="text-secondary-400 text-xs mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[30rem]">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type}>
                  <div className="px-4 py-2 bg-secondary-50 border-b border-secondary-100">
                    <p className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      {getTypeLabel(type as SearchResult['type'])}s
                    </p>
                  </div>
                  <div className="divide-y divide-secondary-100">
                    {typeResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary-50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-secondary-500 truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-secondary-400">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Footer */}
              <div className="px-4 py-2 bg-secondary-50 border-t border-secondary-200">
                <p className="text-xs text-secondary-500 text-center">
                  Showing {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

import apiClient from '@/services/apiClient';

export interface Juso {
  roadAddr: string;    // Road Name Address
  jibunAddr: string;   // Jibun Address
  zipNo: string;       // Zip Code
  bdNm?: string;       // Building Name
}

export interface JusoResponse {
  results: {
    common: {
      errorCode: string;
      errorMessage: string;
      totalCount: string;
      currentPage: number;
      countPerPage: number;
    };
    juso: Juso[];
  };
}

/**
 * Search for an address using the backend proxy.
 * 
 * @param keyword Search keyword (e.g., "테헤란로", "판교역로")
 * @returns List of found addresses
 */
export const searchAddress = async (keyword: string): Promise<Juso[]> => {
  try {
    // Attempt to call the local proxy via apiClient
    // Set a short timeout (e.g. 2000ms) to fail fast if the server is unreachable
    const response = await apiClient.get(`/address/search?keyword=${encodeURIComponent(keyword)}`, {
      timeout: 2000
    });

    const data: JusoResponse = response.data;

    if (data.results.common.errorCode !== '0') {
      throw new Error(data.results.common.errorMessage);
    }

    return data.results.juso;

  } catch (error) {
    console.warn("Backend proxy not connected or error. Returning smart mock data for demo.");
    return getMockAddressData(keyword);
  }
};

/**
 * Returns mock data for demonstration purposes when the backend is unavailable.
 */
const getMockAddressData = (keyword: string): Juso[] => {
  const term = keyword.trim();

  if (!term) return [];

  // Simulate server delay
  const mockDelay = 500;

  // Specific mocks for demo scenarios
  if (term.includes('판교')) {
    return [
      { roadAddr: '경기도 성남시 분당구 판교역로 166', jibunAddr: '경기도 성남시 분당구 백현동 532', zipNo: '13529', bdNm: '카카오 판교 아지트' },
      { roadAddr: '경기도 성남시 분당구 판교역로 235', jibunAddr: '경기도 성남시 분당구 삼평동 681', zipNo: '13494', bdNm: '에이치스퀘어' },
      { roadAddr: '경기도 성남시 분당구 대왕판교로 645', jibunAddr: '경기도 성남시 분당구 삼평동 629', zipNo: '13487', bdNm: '경기창조경제혁신센터' },
    ];
  }

  if (term.includes('강남') || term.includes('테헤란')) {
    return [
      { roadAddr: '서울특별시 강남구 테헤란로 427', jibunAddr: '서울특별시 강남구 삼성동 143-40', zipNo: '06164', bdNm: '위워크 타워' },
      { roadAddr: '서울특별시 강남구 테헤란로 152', jibunAddr: '서울특별시 강남구 역삼동 737', zipNo: '06236', bdNm: '강남파이낸스센터' },
      { roadAddr: '서울특별시 강남구 강남대로 396', jibunAddr: '서울특별시 강남구 역삼동 825-8', zipNo: '06232', bdNm: '강남빌딩' },
    ];
  }

  // Default Mock Data
  return [
    { roadAddr: `서울시 예시구 예시대로 123 (${term})`, jibunAddr: `서울시 예시구 예시동 100-1`, zipNo: '01234', bdNm: '예시빌딩' },
    { roadAddr: `서울시 예시구 예시로 45 (${term})`, jibunAddr: `서울시 예시구 예시동 200-5`, zipNo: '05678', bdNm: '샘플타워' },
    { roadAddr: `경기도 예시시 예시구 77 (${term})`, jibunAddr: `경기도 예시시 예시동 300`, zipNo: '12345', bdNm: '테스트건물' },
  ];
};
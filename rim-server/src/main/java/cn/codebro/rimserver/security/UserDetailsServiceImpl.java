package cn.codebro.rimserver.security;

import com.sagframe.sagacity.sqltoy.plus.dao.SqlToyHelperDao;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final SqlToyHelperDao sqlToyHelperDao;

    public UserDetailsServiceImpl(SqlToyHelperDao sqlToyHelperDao,
                                  UserRepository userRepository) {
        this.sqlToyHelperDao = sqlToyHelperDao;
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user;
    }

}
